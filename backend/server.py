from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid
import json
from datetime import datetime, timedelta
import jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import pandas as pd
import aiofiles
from pathlib import Path

load_dotenv()

app = FastAPI(title="Personal Dashboard Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Database connection
MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client.dashboard_platform

# JWT settings
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))

# Upload settings
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# Models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DashboardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    template_type: str  # fitness, habits, projects, custom
    is_public: bool = False
    custom_domain: Optional[str] = None

class WidgetCreate(BaseModel):
    dashboard_id: str
    widget_type: str  # chart, metric, progress, table
    title: str
    position: Dict[str, Any]  # x, y, width, height
    config: Dict[str, Any]  # widget-specific configuration
    data_source: Optional[Dict[str, Any]] = None

class DataPointCreate(BaseModel):
    dashboard_id: str
    widget_id: str
    data: Dict[str, Any]
    timestamp: Optional[datetime] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"user_id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Personal Dashboard Platform API"}

@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True,
        "friends": [],
        "public_profile": True
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_access_token(user_id)
    
    return {
        "user_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["user_id"])
    
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "created_at": current_user["created_at"],
        "friends_count": len(current_user.get("friends", []))
    }

@app.post("/api/dashboards")
async def create_dashboard(dashboard_data: DashboardCreate, current_user = Depends(get_current_user)):
    dashboard_id = str(uuid.uuid4())
    
    dashboard_doc = {
        "dashboard_id": dashboard_id,
        "owner_id": current_user["user_id"],
        "title": dashboard_data.title,
        "description": dashboard_data.description,
        "template_type": dashboard_data.template_type,
        "is_public": dashboard_data.is_public,
        "custom_domain": dashboard_data.custom_domain,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "widgets": [],
        "layout": {},
        "theme": "default",
        "views": 0,
        "followers": []
    }
    
    await db.dashboards.insert_one(dashboard_doc)
    
    return {"dashboard_id": dashboard_id, "message": "Dashboard created successfully"}

@app.get("/api/dashboards")
async def get_user_dashboards(current_user = Depends(get_current_user)):
    dashboards = await db.dashboards.find(
        {"owner_id": current_user["user_id"]},
        {"_id": 0, "password_hash": 0}
    ).to_list(None)
    
    return {"dashboards": dashboards}

@app.get("/api/dashboards/{dashboard_id}")
async def get_dashboard(dashboard_id: str, current_user = Depends(get_current_user)):
    dashboard = await db.dashboards.find_one(
        {"dashboard_id": dashboard_id},
        {"_id": 0}
    )
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # Check if user has access (owner or public dashboard)
    if dashboard["owner_id"] != current_user["user_id"] and not dashboard.get("is_public", False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get widgets for this dashboard
    widgets = await db.widgets.find(
        {"dashboard_id": dashboard_id},
        {"_id": 0}
    ).to_list(None)
    dashboard["widgets"] = widgets
    
    return dashboard

@app.post("/api/widgets")
async def create_widget(widget_data: WidgetCreate, current_user = Depends(get_current_user)):
    # Verify dashboard ownership
    dashboard = await db.dashboards.find_one({"dashboard_id": widget_data.dashboard_id})
    if not dashboard or dashboard["owner_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    widget_id = str(uuid.uuid4())
    
    widget_doc = {
        "widget_id": widget_id,
        "dashboard_id": widget_data.dashboard_id,
        "owner_id": current_user["user_id"],
        "widget_type": widget_data.widget_type,
        "title": widget_data.title,
        "position": widget_data.position,
        "config": widget_data.config,
        "data_source": widget_data.data_source,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.widgets.insert_one(widget_doc)
    
    return {"widget_id": widget_id, "message": "Widget created successfully"}

@app.post("/api/data")
async def add_data_point(data_point: DataPointCreate, current_user = Depends(get_current_user)):
    # Verify widget ownership
    widget = await db.widgets.find_one({"widget_id": data_point.widget_id})
    if not widget or widget["owner_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data_doc = {
        "data_id": str(uuid.uuid4()),
        "dashboard_id": data_point.dashboard_id,
        "widget_id": data_point.widget_id,
        "owner_id": current_user["user_id"],
        "data": data_point.data,
        "timestamp": data_point.timestamp or datetime.utcnow(),
        "created_at": datetime.utcnow()
    }
    
    await db.data_points.insert_one(data_doc)
    
    return {"message": "Data point added successfully"}

@app.get("/api/data/{widget_id}")
async def get_widget_data(widget_id: str, current_user = Depends(get_current_user)):
    # Verify widget access
    widget = await db.widgets.find_one({"widget_id": widget_id})
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    # Check access (owner or public dashboard)
    dashboard = await db.dashboards.find_one({"dashboard_id": widget["dashboard_id"]})
    if dashboard["owner_id"] != current_user["user_id"] and not dashboard.get("is_public", False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    data_points = await db.data_points.find(
        {"widget_id": widget_id}
    ).sort("timestamp", 1).to_list(None)
    
    return {"data": data_points}

@app.post("/api/upload/csv")
async def upload_csv_data(
    file: UploadFile = File(...),
    dashboard_id: str = None,
    widget_id: str = None,
    current_user = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_path = Path(UPLOAD_FOLDER) / f"{file_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Process CSV
    try:
        df = pd.read_csv(file_path)
        data_points = []
        
        for _, row in df.iterrows():
            data_point = {
                "data_id": str(uuid.uuid4()),
                "dashboard_id": dashboard_id,
                "widget_id": widget_id,
                "owner_id": current_user["user_id"],
                "data": row.to_dict(),
                "timestamp": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            data_points.append(data_point)
        
        if data_points and dashboard_id and widget_id:
            await db.data_points.insert_many(data_points)
        
        return {
            "message": f"Successfully processed {len(data_points)} rows",
            "file_id": file_id,
            "preview": data_points[:5] if data_points else []
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@app.get("/api/dashboards/public/discover")
async def discover_public_dashboards(skip: int = 0, limit: int = 20):
    dashboards = await db.dashboards.find(
        {"is_public": True},
        {"owner_password": 0}
    ).skip(skip).limit(limit).to_list(None)
    
    # Add owner info
    for dashboard in dashboards:
        owner = await db.users.find_one(
            {"user_id": dashboard["owner_id"]},
            {"username": 1, "full_name": 1}
        )
        dashboard["owner"] = owner
    
    return {"dashboards": dashboards}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
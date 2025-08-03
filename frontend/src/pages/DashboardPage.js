import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Settings, Share2, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import DashboardGrid from '../components/DashboardGrid';

const DashboardPage = () => {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dashboardId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboards();
  }, []);

  useEffect(() => {
    if (dashboardId && dashboards.length > 0) {
      fetchDashboardDetails(dashboardId);
    }
  }, [dashboardId, dashboards]);

  const fetchDashboards = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/api/dashboards`);
      setDashboards(response.data.dashboards || []);
    } catch (error) {
      toast.error('Failed to fetch dashboards');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardDetails = async (id) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/api/dashboards/${id}`);
      setSelectedDashboard(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no specific dashboard is selected, show dashboard list
  if (!dashboardId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboards</h1>
              <p className="text-gray-600">Manage and view your personal tracking dashboards</p>
            </div>
            <Link
              to="/create-dashboard"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Dashboard</span>
            </Link>
          </div>

          {dashboards.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No dashboards yet</h3>
              <p className="text-gray-600 mb-6">Create your first dashboard to start tracking your goals</p>
              <Link
                to="/create-dashboard"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Dashboard</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <div key={dashboard.dashboard_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{dashboard.title}</h3>
                      <p className="text-sm text-gray-600">{dashboard.description || 'No description'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                      {dashboard.is_public && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Share2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
                      {dashboard.template_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{dashboard.widgets?.length || 0} widgets</span>
                      <span>{dashboard.views || 0} views</span>
                    </div>
                    <Link
                      to={`/dashboard/${dashboard.dashboard_id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Dashboard →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show specific dashboard details
  return (
    <div className="min-h-screen bg-gray-50">
      {selectedDashboard ? (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedDashboard.title}</h1>
                <p className="text-gray-600">{selectedDashboard.description}</p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                {selectedDashboard.is_public && (
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Dashboard Grid */}
            <DashboardGrid 
              dashboardId={selectedDashboard.dashboard_id}
              widgets={selectedDashboard.widgets || []}
              onLayoutChange={(layouts) => {
                // Save layout changes to backend
                console.log('Layout changed:', layouts);
              }}
              onWidgetUpdate={(updatedWidgets) => {
                // Update widgets in state and backend
                setSelectedDashboard(prev => ({
                  ...prev,
                  widgets: updatedWidgets
                }));
              }}
              onWidgetDelete={(widgetId) => {
                // Remove widget from state and backend
                setSelectedDashboard(prev => ({
                  ...prev,
                  widgets: prev.widgets.filter(w => w.widget_id !== widgetId)
                }));
              }}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
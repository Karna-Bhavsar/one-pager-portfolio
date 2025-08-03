import React from 'react';
import { CheckCircle2, Circle, Target, Calendar } from 'lucide-react';

const ProgressWidget = ({ title, current, target, unit, config = {} }) => {
  const {
    type = 'circular', // circular, linear, streak
    color = 'blue',
    showPercentage = true,
    showTarget = true,
    streakData = []
  } = config;

  const percentage = target ? Math.min((current / target) * 100, 100) : 0;
  
  const colorClasses = {
    blue: { 
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
      light: 'bg-blue-100'
    },
    green: { 
      bg: 'from-green-500 to-green-600',
      text: 'text-green-600',
      light: 'bg-green-100'
    },
    purple: { 
      bg: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      light: 'bg-purple-100'
    },
    orange: { 
      bg: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
      light: 'bg-orange-100'
    }
  };

  const colors = colorClasses[color];

  const renderCircularProgress = () => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="stop-blue-500" />
                <stop offset="100%" className="stop-blue-600" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${colors.text}`}>
                {Math.round(percentage)}%
              </div>
              <div className="text-xs text-gray-500">
                {current.toLocaleString()}/{target.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLinearProgress = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Progress</span>
        <span className={`text-sm font-medium ${colors.text}`}>
          {current.toLocaleString()} / {target.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`bg-gradient-to-r ${colors.bg} h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
        </div>
      </div>
      {showPercentage && (
        <div className="text-center">
          <span className={`text-lg font-semibold ${colors.text}`}>
            {Math.round(percentage)}% Complete
          </span>
        </div>
      )}
    </div>
  );

  const renderStreakCalendar = () => {
    const today = new Date();
    const daysToShow = 35;
    const days = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasActivity = streakData.includes(dateStr);
      days.push({ date: dateStr, hasActivity, day: date.getDate() });
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                day.hasActivity 
                  ? `bg-gradient-to-r ${colors.bg} text-white` 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Current streak: {current} days</span>
          <span>Best: {target} days</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <Target className={`h-5 w-5 ${colors.text}`} />
          {showTarget && (
            <span className="text-sm text-gray-500">
              Target: {target.toLocaleString()} {unit}
            </span>
          )}
        </div>
      </div>

      {type === 'circular' && renderCircularProgress()}
      {type === 'linear' && renderLinearProgress()}
      {type === 'streak' && renderStreakCalendar()}
    </div>
  );
};

export default ProgressWidget;
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

const MetricWidget = ({ title, value, previousValue, unit, target, config = {} }) => {
  const {
    showTrend = true,
    showTarget = false,
    color = 'blue',
    size = 'medium'
  } = config;

  // Calculate trend
  const trend = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  // Calculate target progress
  const targetProgress = target ? Math.min((value / target) * 100, 100) : 0;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">{title}</h3>
        {showTrend && (
          <div className={`flex items-center space-x-1 text-sm ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {!isPositive && !isNegative && <Minus className="h-4 w-4" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>

        {showTarget && target && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress to Target</span>
              <span className="text-gray-900 font-medium">{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${targetProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Target className="h-3 w-3" />
              <span>Target: {target.toLocaleString()} {unit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricWidget;
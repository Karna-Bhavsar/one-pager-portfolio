import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartWidget = ({ title, data, config = {} }) => {
  const {
    type = 'line',
    xKey = 'date',
    yKey = 'value',
    color = '#3B82F6',
    fillColor = '#3B82F680',
    showGrid = true,
    showTooltip = true,
    height = 300
  } = config;

  // Sample data if none provided
  const chartData = data || [
    { date: '2024-01-01', value: 120 },
    { date: '2024-01-02', value: 135 },
    { date: '2024-01-03', value: 125 },
    { date: '2024-01-04', value: 145 },
    { date: '2024-01-05', value: 160 },
    { date: '2024-01-06', value: 155 },
    { date: '2024-01-07', value: 170 }
  ];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            {showTooltip && <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />}
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              fill={fillColor}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            {showTooltip && <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />}
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            {showTooltip && <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />}
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-gray-500 capitalize">{type} Chart</span>
        </div>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
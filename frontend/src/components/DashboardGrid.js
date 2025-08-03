import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Plus, Settings, Trash2, Edit3, Move } from 'lucide-react';
import MetricWidget from './widgets/MetricWidget';
import ChartWidget from './widgets/ChartWidget';
import ProgressWidget from './widgets/ProgressWidget';
import TableWidget from './widgets/TableWidget';
import { generateSampleData } from '../utils/sampleData';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid = ({ dashboardId, widgets = [], dashboardType = 'custom', onLayoutChange, onWidgetUpdate, onWidgetDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Generate sample data based on dashboard type
  const sampleData = generateSampleData(dashboardType);

  // Default layout configuration
  const defaultLayouts = {
    lg: widgets.map((widget, index) => ({
      i: widget.widget_id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: 4,
      h: 4,
      minW: 2,
      minH: 3
    })),
    md: widgets.map((widget, index) => ({
      i: widget.widget_id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 4,
      w: 6,
      h: 4
    })),
    sm: widgets.map((widget, index) => ({
      i: widget.widget_id,
      x: 0,
      y: index * 4,
      w: 12,
      h: 4
    }))
  };

  const [layouts, setLayouts] = useState(defaultLayouts);

  const handleLayoutChange = useCallback((layout, allLayouts) => {
    setLayouts(allLayouts);
    if (onLayoutChange) {
      onLayoutChange(allLayouts);
    }
  }, [onLayoutChange]);

  const renderWidget = (widget) => {
    const baseProps = {
      key: widget.widget_id,
      title: widget.title,
      config: widget.config || {}
    };

    // Get appropriate sample data based on widget type and dashboard type
    const getWidgetData = () => {
      switch (widget.widget_type) {
        case 'metric':
          return sampleData.metrics?.[0] || {
            value: Math.floor(Math.random() * 1000),
            previousValue: Math.floor(Math.random() * 900),
            unit: 'items',
            target: Math.floor(Math.random() * 1200)
          };
        case 'chart':
          return sampleData.charts?.[0] || {
            data: [
              { date: '2024-01-01', value: 120 },
              { date: '2024-01-02', value: 135 },
              { date: '2024-01-03', value: 125 },
              { date: '2024-01-04', value: 145 },
              { date: '2024-01-05', value: 160 },
              { date: '2024-01-06', value: 155 },
              { date: '2024-01-07', value: 170 }
            ]
          };
        case 'progress':
          return sampleData.progress?.[0] || sampleData.streaks?.[0] || {
            current: Math.floor(Math.random() * 80),
            target: 100,
            unit: 'percent'
          };
        case 'table':
          return {
            data: sampleData.activities || sampleData.subjects || [
              { id: 1, date: '2024-01-18', activity: 'Sample Activity', value: 42 },
              { id: 2, date: '2024-01-17', activity: 'Another Activity', value: 38 },
              { id: 3, date: '2024-01-16', activity: 'Third Activity', value: 29 }
            ],
            columns: [
              { key: 'date', label: 'Date', sortable: true },
              { key: 'activity', label: 'Activity', sortable: true },
              { key: 'value', label: 'Value', sortable: true }
            ]
          };
        default:
          return {};
      }
    };

    const widgetData = getWidgetData();

    switch (widget.widget_type) {
      case 'metric':
        return (
          <MetricWidget
            {...baseProps}
            {...widgetData}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            {...baseProps}
            {...widgetData}
          />
        );
      case 'progress':
        return (
          <ProgressWidget
            {...baseProps}
            {...widgetData}
          />
        );
      case 'table':
        return (
          <TableWidget
            {...baseProps}
            {...widgetData}
          />
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Settings className="h-8 w-8 mx-auto mb-2" />
              <p>Unknown widget type</p>
            </div>
          </div>
        );
    }
  };

  const addSampleWidget = (type) => {
    const newWidget = {
      widget_id: `widget_${Date.now()}`,
      widget_type: type,
      title: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      config: {
        color: ['blue', 'green', 'purple', 'orange'][Math.floor(Math.random() * 4)]
      }
    };

    // Add to layout
    const newLayout = {
      i: newWidget.widget_id,
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      minW: 2,
      minH: 3
    };

    setLayouts(prev => ({
      ...prev,
      lg: [...(prev.lg || []), newLayout],
      md: [...(prev.md || []), { ...newLayout, w: 6 }],
      sm: [...(prev.sm || []), { ...newLayout, w: 12 }]
    }));

    if (onWidgetUpdate) {
      onWidgetUpdate([...widgets, newWidget]);
    }

    setShowAddWidget(false);
  };

  const deleteWidget = (widgetId) => {
    setLayouts(prev => ({
      lg: prev.lg?.filter(item => item.i !== widgetId) || [],
      md: prev.md?.filter(item => item.i !== widgetId) || [],
      sm: prev.sm?.filter(item => item.i !== widgetId) || []
    }));

    if (onWidgetDelete) {
      onWidgetDelete(widgetId);
    }
  };

  const widgetTypes = [
    { type: 'metric', label: 'Metric Card', icon: '📊', description: 'Display key numbers and KPIs' },
    { type: 'chart', label: 'Chart', icon: '📈', description: 'Line, bar, and area charts' },
    { type: 'progress', label: 'Progress', icon: '🎯', description: 'Goals and progress tracking' },
    { type: 'table', label: 'Data Table', icon: '📋', description: 'Sortable data tables' }
  ];

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              editMode 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>{editMode ? 'Done Editing' : 'Edit Layout'}</span>
          </button>
          
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Widget</span>
          </button>
        </div>

        {editMode && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <Move className="h-4 w-4" />
            <span>Drag to reposition • Resize from corners</span>
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Widget</h3>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {widgetTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => addSampleWidget(type.type)}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddWidget(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
      >
        {widgets.map((widget) => (
          <div key={widget.widget_id} className="relative group">
            {renderWidget(widget)}
            
            {/* Widget Controls (shown in edit mode) */}
            {editMode && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={() => deleteWidget(widget.widget_id)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <button className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                    <Settings className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No widgets yet</h3>
          <p className="text-gray-600 mb-6">Add your first widget to start visualizing your data</p>
          <button
            onClick={() => setShowAddWidget(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Widget</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Save, BarChart3, Activity, Target, BookOpen } from 'lucide-react';
import { getDashboardTemplate } from '../utils/sampleData';

const CreateDashboardPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template_type: 'custom',
    is_public: false,
    custom_domain: '',
    include_sample_data: true
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const templates = [
    {
      id: 'fitness',
      name: 'Fitness Tracking',
      icon: <Activity className="h-6 w-6" />,
      description: 'Track workouts, runs, and fitness goals',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'habits',
      name: 'Habit Building',
      icon: <Target className="h-6 w-6" />,
      description: 'Monitor daily habits and routines',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'learning',
      name: 'Learning Goals',
      icon: <BookOpen className="h-6 w-6" />,
      description: 'Track reading, courses, and skills',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'custom',
      name: 'Custom',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'Create your own tracking system',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Create the dashboard
      const dashboardResponse = await axios.post(`${API_BASE_URL}/api/dashboards`, {
        title: formData.title,
        description: formData.description,
        template_type: formData.template_type,
        is_public: formData.is_public,
        custom_domain: formData.custom_domain
      });
      
      if (dashboardResponse.data.dashboard_id) {
        const dashboardId = dashboardResponse.data.dashboard_id;
        
        // Add sample widgets if requested
        if (formData.include_sample_data && formData.template_type !== 'custom') {
          const sampleWidgets = getDashboardTemplate(formData.template_type);
          
          // Create each sample widget
          for (const widget of sampleWidgets) {
            try {
              await axios.post(`${API_BASE_URL}/api/widgets`, {
                dashboard_id: dashboardId,
                widget_type: widget.widget_type,
                title: widget.title,
                position: {
                  x: 0,
                  y: 0,
                  width: 4,
                  height: 4
                },
                config: widget.config,
                data_source: null
              });
            } catch (widgetError) {
              console.error('Error creating widget:', widgetError);
              // Continue with other widgets even if one fails
            }
          }
        }
        
        toast.success('Dashboard created successfully!');
        navigate(`/dashboard/${dashboardId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Dashboard</h1>
          <p className="text-gray-600">Build your personalized tracking dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Fitness Journey, Reading Goals 2024"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of what you're tracking..."
                />
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose a Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.template_type === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, template_type: template.id }))}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="template_type"
                      value={template.id}
                      checked={formData.template_type === template.id}
                      onChange={handleChange}
                      className="absolute top-4 right-4"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Make this dashboard public (others can view and follow)
                </label>
              </div>

              {formData.is_public && (
                <div>
                  <label htmlFor="custom_domain" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    id="custom_domain"
                    name="custom_domain"
                    value={formData.custom_domain}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="my-awesome-dashboard"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be available at: your-domain.com/{formData.custom_domain || 'your-url'}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Creating...' : 'Create Dashboard'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboardPage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Eye, Users, BarChart3, TrendingUp } from 'lucide-react';

const PublicDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dashboardId } = useParams();

  useEffect(() => {
    fetchDashboard();
  }, [dashboardId]);

  const fetchDashboard = async () => {
    try {
      // Note: For public dashboards, we'll need to create a separate endpoint that doesn't require auth
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/api/dashboards/${dashboardId}`);
      setDashboard(response.data);
    } catch (error) {
      setError('Dashboard not found or not public');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dashboard.title}</h1>
                <p className="text-gray-600 mb-4">{dashboard.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>by {dashboard.owner?.username || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{dashboard.views || 0} views</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {dashboard.template_type}
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Follow</span>
                </button>
                <button className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Clone Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {dashboard.widgets && dashboard.widgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboard.widgets.map((widget) => (
                <div key={widget.widget_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
                  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Widget visualization will be displayed here based on the data
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-gray-600">
                This dashboard doesn't have any widgets or data to display yet.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-12 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inspired by this dashboard?
            </h2>
            <p className="text-gray-600 mb-6">
              Create your own personalized tracking dashboard and share your journey.
            </p>
            <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <BarChart3 className="h-5 w-5" />
              <span>Create Similar Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboardPage;
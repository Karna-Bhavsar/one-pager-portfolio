import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Eye, Users, Calendar, BarChart3 } from 'lucide-react';

const DiscoverPage = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPublicDashboards();
  }, []);

  const fetchPublicDashboards = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/api/dashboards/public/discover`);
      setDashboards(response.data.dashboards || []);
    } catch (error) {
      console.error('Failed to fetch public dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.template_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Dashboards</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore inspiring dashboards from our community. Get ideas for your own tracking journey.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search dashboards..."
            />
          </div>
        </div>

        {/* Dashboards Grid */}
        {filteredDashboards.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? 'No dashboards found' : 'No public dashboards yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Be the first to create and share a public dashboard!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDashboards.map((dashboard) => (
              <div key={dashboard.dashboard_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Dashboard Preview */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-blue-400" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {dashboard.template_type}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {dashboard.views || 0}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{dashboard.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {dashboard.description || 'No description available'}
                  </p>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>by {dashboard.owner?.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(dashboard.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/public/${dashboard.dashboard_id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to create your own dashboard?
          </h2>
          <p className="text-gray-600 mb-6">
            Start tracking what matters to you and inspire others with your progress.
          </p>
          <Link
            to="/create-dashboard"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Create Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
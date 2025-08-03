import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, Globe, TrendingUp, Activity, Heart, BookOpen, Target } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Flexible Dashboards",
      description: "Create beautiful, customizable dashboards for any tracking goal"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Social Motivation",
      description: "Connect with friends and stay motivated through shared progress"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Public Sharing",
      description: "Share your achievements on custom domains for maximum impact"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Rich Analytics",
      description: "Powerful charts and insights to track your progress over time"
    }
  ];

  const useCases = [
    {
      icon: <Activity className="h-8 w-8 text-blue-600" />,
      title: "Fitness Tracking",
      description: "Monitor workouts, runs, and fitness goals",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Habit Building",
      description: "Track daily habits and build lasting routines",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Learning Goals",
      description: "Document your reading, courses, and skill development",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "Project Progress",
      description: "Visualize project milestones and deliverables",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Beautiful
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Personal Dashboards</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track anything that matters to you - from surfing sessions to sobriety streaks, 
              reading goals to fitness milestones. Build data-rich dashboards that motivate and inspire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link 
                  to="/create-dashboard" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your Dashboard
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
              <Link 
                to="/discover" 
                className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                Explore Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Track Anything That Matters
            </h2>
            <p className="text-xl text-gray-600">
              From personal goals to professional projects - make it visual, make it social
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Personal Tracking
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create compelling, data-rich personal dashboards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are already creating beautiful, motivating dashboards
          </p>
          {!isAuthenticated && (
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { FaRocket, FaTrophy, FaChartLine, FaUsers } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <FaRocket className="text-4xl text-primary" />,
      title: 'Interactive Quizzes',
      description: 'Engage with dynamic multiple-choice questions across various topics',
    },
    {
      icon: <FaTrophy className="text-4xl text-warning" />,
      title: 'Leaderboards',
      description: 'Compete with others and track your ranking on global leaderboards',
    },
    {
      icon: <FaChartLine className="text-4xl text-secondary" />,
      title: 'Progress Tracking',
      description: 'Monitor your performance and improvement over time',
    },
    {
      icon: <FaUsers className="text-4xl text-indigo-600" />,
      title: 'Community Learning',
      description: 'Join a community of learners and challenge yourself',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to QuizApp
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Test your knowledge, track your progress, and compete with others
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup">
                    <Button variant="secondary" className="px-8 py-3 text-lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="px-8 py-3 text-lg bg-white text-primary border-white hover:bg-gray-100">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={isAdmin() ? '/admin/dashboard' : '/dashboard'}>
                  <Button variant="secondary" className="px-8 py-3 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuizApp?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to enhance your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-xl text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">100+</div>
              <div className="text-xl text-gray-600">Quizzes Available</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-warning mb-2">10K+</div>
              <div className="text-xl text-gray-600">Questions Answered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-primary to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Quiz Journey?
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of learners and test your knowledge today
            </p>
            <Link to="/signup">
              <Button variant="secondary" className="px-8 py-3 text-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

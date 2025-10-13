import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import { FaUserPlus } from 'react-icons/fa';

const Signup = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-green-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                <FaUserPlus className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us and start your quiz journey
            </p>
          </div>

          {/* Signup Form */}
          <SignupForm />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-secondary hover:text-green-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

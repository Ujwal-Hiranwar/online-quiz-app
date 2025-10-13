import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import { FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-5xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-indigo-700 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

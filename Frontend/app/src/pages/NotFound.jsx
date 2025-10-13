import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <FaExclamationTriangle className="text-9xl text-warning mx-auto mb-8" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link to="/">
          <Button variant="primary" className="px-8 py-3">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

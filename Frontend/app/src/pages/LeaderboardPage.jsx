import React from 'react';
import { Link } from 'react-router-dom';
import Leaderboard from '../components/leaderboard/Leaderboard';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { FaArrowLeft } from 'react-icons/fa';

const LeaderboardPage = () => {
  const { isAdmin } = useAuth();
  const dashboardUrl = isAdmin() ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link to={dashboardUrl}>
            <Button variant="outline" className="flex items-center space-x-2">
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';
import { FaClipboardList, FaUsers, FaTrophy } from 'react-icons/fa';
const AdminDashboardComponent = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader size="large" text="Loading Statistics..." />;
  }

  const statCards = [
    {
      title: 'Total Quizzes',
      value: stats?.totalQuizzes || 0,
      icon: <FaClipboardList className="text-4xl text-primary" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-primary',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FaUsers className="text-4xl text-warning" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-warning',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('quizzes')}
            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaClipboardList />
            <span>Manage Quizzes</span>
          </button>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <FaTrophy />
            <span>Quiz Results</span>
          </Link>
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaUsers />
            <span>Manage Users</span>
          </button>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboardComponent;

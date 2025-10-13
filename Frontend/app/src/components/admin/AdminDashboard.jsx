import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';
import { FaClipboardList, FaUsers, FaQuestionCircle, FaChartLine } from 'react-icons/fa';

const AdminDashboardComponent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
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
      title: 'Total Questions',
      value: stats?.totalQuestions || 0,
      icon: <FaQuestionCircle className="text-4xl text-secondary" />,
      bgColor: 'bg-green-50',
      textColor: 'text-secondary',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FaUsers className="text-4xl text-warning" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-warning',
    },
    {
      title: 'Total Attempts',
      value: stats?.totalAttempts || 0,
      icon: <FaChartLine className="text-4xl text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Recent Activity */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{activity.userName}</p>
                  <p className="text-sm text-gray-600">
                    Completed: {activity.quizTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    activity.score >= 80 ? 'text-green-600' :
                    activity.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {activity.score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardComponent;

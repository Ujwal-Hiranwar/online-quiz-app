import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import Loader from '../common/Loader';
import { FaTrophy, FaChartLine, FaClipboardList, FaMedal } from 'react-icons/fa';

const UserDashboardComponent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserStats();
      setStats(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const statCards = [
    {
      title: 'Quizzes Taken',
      value: stats?.totalQuizzesTaken || 0,
      icon: <FaClipboardList className="text-4xl text-primary" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Score',
      value: `${stats?.averageScore || 0}%`,
      icon: <FaChartLine className="text-4xl text-secondary" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Best Score',
      value: `${stats?.bestScore || 0}%`,
      icon: <FaTrophy className="text-4xl text-warning" />,
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Points',
      value: stats?.totalPoints || 0,
      icon: <FaMedal className="text-4xl text-red-500" />,
      bgColor: 'bg-red-50',
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
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
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
          <Link
            to="/dashboard"
            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaClipboardList />
            <span>Browse Quizzes</span>
          </Link>
          <Link
            to="/quiz-history"
            className="flex items-center justify-center space-x-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaChartLine />
            <span>View History</span>
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center space-x-2 bg-warning text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <FaTrophy />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentQuizzes && stats.recentQuizzes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentQuizzes.map((quiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{quiz.quizTitle}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(quiz.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    quiz.score >= 80 ? 'text-green-600' :
                    quiz.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {quiz.score}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {quiz.correctAnswers}/{quiz.totalQuestions}
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

export default UserDashboardComponent;

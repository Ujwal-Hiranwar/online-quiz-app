import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboardComponent from '../components/admin/AdminDashboard';
import AdminQuizList from '../components/admin/QuizList';
import UserList from '../components/admin/UserList';
import { FaHome, FaClipboardList, FaUsers } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaHome />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaClipboardList />
              <span>Manage Quizzes</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaUsers />
              <span>Manage Users</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <AdminDashboardComponent setActiveTab={setActiveTab} />}
          {activeTab === 'quizzes' && <AdminQuizList />}
          {activeTab === 'users' && <UserList />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

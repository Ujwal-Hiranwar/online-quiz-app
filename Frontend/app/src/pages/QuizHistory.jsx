import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import quizService from '../services/quizService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaChartLine, FaCalendar, FaRedo } from 'react-icons/fa';
import { formatDate, calculatePercentage, getScoreColor } from '../utils/helpers';

const QuizHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await quizService.getUserQuizHistory();
      setHistory(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quiz history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    const percentage = calculatePercentage(item.score, item.totalQuestions);
    if (filter === 'passed') return percentage >= 60;
    if (filter === 'failed') return percentage < 60;
    return true;
  });

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz History</h1>
          <p className="text-gray-600">Review your past quiz attempts and performance</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'passed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Passed ({history.filter(h => calculatePercentage(h.score, h.totalQuestions) >= 60).length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Failed ({history.filter(h => calculatePercentage(h.score, h.totalQuestions) < 60).length})
            </button>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-4">No quiz history found</p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Take Your First Quiz
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredHistory.map((item, index) => {
              const percentage = calculatePercentage(item.score, item.totalQuestions);
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.quizTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center space-x-1">
                          <FaCalendar />
                          <span>{formatDate(item.completedAt)}</span>
                        </span>
                        {item.timeTaken && (
                          <span>Time: {item.timeTaken}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Score: {item.score}/{item.totalQuestions}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage >= 60 ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(percentage)} mb-2`}>
                        {percentage}%
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/quiz/${item.quizId}`)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <FaRedo />
                        <span>Retake</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;

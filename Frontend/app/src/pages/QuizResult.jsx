import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrophy, FaCheckCircle, FaTimesCircle, FaChartPie, FaHome, FaRedo } from 'react-icons/fa';
import Button from '../components/common/Button';
import { calculatePercentage, getScoreColor } from '../utils/helpers';

const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    navigate('/dashboard');
    return null;
  }

  const percentage = calculatePercentage(result.scoreObtained, result.totalScore);
  const scoreColorClass = getScoreColor(percentage);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: 'Outstanding!', emoji: '🌟' };
    if (percentage >= 80) return { message: 'Excellent!', emoji: '🎉' };
    if (percentage >= 70) return { message: 'Great Job!', emoji: '👏' };
    if (percentage >= 60) return { message: 'Good Effort!', emoji: '👍' };
    return { message: 'Keep Practicing!', emoji: '💪' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 text-white text-center">
            <div className="text-6xl mb-4">{performance.emoji}</div>
            <h1 className="text-4xl font-bold mb-2">{performance.message}</h1>
            <p className="text-xl text-indigo-100">Quiz Completed!</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`text-7xl font-bold ${scoreColorClass} mb-4`}>
                {percentage}%
              </div>
              <p className="text-2xl text-gray-600">
                {result.scoreObtained} out of {result.totalScore} correct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600">{result.scoreObtained}</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 text-center">
                <FaTimesCircle className="text-4xl text-red-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Incorrect Answers</p>
                <p className="text-3xl font-bold text-red-600">
                  {result.totalScore - result.scoreObtained}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <FaChartPie className="text-4xl text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
              </div>
            </div>

            {result.timeTakenMinutes && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 text-center">
                <p className="text-gray-600">
                  Time Taken: <span className="font-bold text-gray-900">{result.timeTakenMinutes} minutes</span>
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center space-x-2"
              >
                <FaHome />
                <span>Back to Dashboard</span>
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/quiz/${result.quizId}`)}
                className="flex items-center justify-center space-x-2"
              >
                <FaRedo />
                <span>Retake Quiz</span>
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/leaderboard')}
                className="flex items-center justify-center space-x-2"
              >
                <FaTrophy />
                <span>View Leaderboard</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

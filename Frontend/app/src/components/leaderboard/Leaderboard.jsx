import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import quizService from '../../services/quizService';
import Loader from '../common/Loader';
import { FaTrophy, FaUser } from 'react-icons/fa';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuizLeaderboard(selectedQuiz);
    } else {
      setLeaderboard([]); // Clear leaderboard if no quiz is selected
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchQuizLeaderboard = async (quizId) => {
    try {
      setLoadingLeaderboard(true);
      const data = await quizService.getQuizLeaderboard(quizId);
      setLeaderboard(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quiz leaderboard');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleQuizSelection = (e) => {
    setSelectedQuiz(e.target.value);
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz Leaderboard</h1>

      <div className="mb-6">
        <label htmlFor="quiz-select" className="block text-sm font-medium text-gray-700 mb-2">Select a Quiz:</label>
        {loadingQuizzes ? (
          <Loader text="Loading Quizzes..." />
        ) : (
          <select
            id="quiz-select"
            value={selectedQuiz}
            onChange={handleQuizSelection}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select a Quiz --</option>
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        )}
      </div>

      {loadingLeaderboard ? (
        <Loader size="large" text="Loading Leaderboard..." />
      ) : !selectedQuiz ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Please select a quiz to view its leaderboard.</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No leaderboard data available for this quiz.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answers</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-700">
                    #{entry.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{entry.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{`${entry.totalScore}/${entry.totalQuestions}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{entry.averageScore ? `${entry.averageScore.toFixed(2)}%` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

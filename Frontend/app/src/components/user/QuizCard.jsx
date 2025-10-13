import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaPlayCircle } from 'react-icons/fa';
import Button from '../common/Button';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Quiz Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
        <p className="text-indigo-100 text-sm">{quiz.category || 'General'}</p>
      </div>

      {/* Quiz Details */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {quiz.description || 'Test your knowledge with this exciting quiz!'}
        </p>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <FaQuestionCircle className="text-primary" />
            <span>{quiz.totalQuestions || 0} Questions</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center space-x-2">
              <FaClock className="text-secondary" />
              <span>{quiz.timeLimit} mins</span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            quiz.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
            quiz.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {quiz.difficulty || 'MEDIUM'}
          </span>
        </div>

        {/* Start Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleStartQuiz}
          className="flex items-center justify-center space-x-2"
        >
          <FaPlayCircle />
          <span>Start Quiz</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;

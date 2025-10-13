import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import quizService from '../../services/quizService';
import QuizCard from './QuizCard';
import Loader from '../common/Loader';
import { FaSearch } from 'react-icons/fa';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, selectedDifficulty, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'ALL') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedDifficulty('EASY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'EASY'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setSelectedDifficulty('MEDIUM')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'MEDIUM'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedDifficulty('HARD')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'HARD'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hard
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No quizzes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;

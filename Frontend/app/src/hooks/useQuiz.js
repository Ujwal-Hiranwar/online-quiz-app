import { useState, useEffect } from 'react';
import quizService from '../services/quizService';

export const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      const questionsData = await quizService.getQuizQuestions(quizId);
      setQuiz(quizData);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  return { quiz, questions, loading, error, refetch: fetchQuiz };
};

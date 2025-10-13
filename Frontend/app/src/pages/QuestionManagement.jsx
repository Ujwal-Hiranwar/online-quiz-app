import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import quizService from '../services/quizService';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import QuestionForm from '../components/admin/QuestionForm';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const QuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizQuestions(quizId)
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      toast.error(error || 'Failed to fetch quiz data');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this question?');
    
    if (!confirmed) return;

    try {
      await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
      toast.success('Question deleted successfully!');
      fetchQuizData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleSubmitQuestion = async (questionData) => {
    try {
      if (isEditing && selectedQuestion) {
        await api.put(`/quizzes/${quizId}/questions/${selectedQuestion.id}`, questionData);
      } else {
        await api.post(`/quizzes/${quizId}/questions`, questionData);
      }
      setShowModal(false);
      fetchQuizData();
    } catch (error) {
      throw error.response?.data?.message || 'Failed to save question';
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-3 py-1 bg-primary text-white rounded-full">
                    {questions.length} Questions
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    quiz.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleAddQuestion}
                className="flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Question</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500 mb-4">No questions added yet</p>
            <Button variant="primary" onClick={handleAddQuestion}>
              Add Your First Question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-bold text-primary">Q{index + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        question.type === 'SINGLE_CHOICE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {question.type === 'SINGLE_CHOICE' ? 'Single Choice' : 'Multiple Choice'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        question.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                    <p className="text-lg text-gray-900 font-medium mb-4">
                      {question.questionText}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        question.correctAnswers?.includes(optIndex)
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      {question.correctAnswers?.includes(optIndex) && (
                        <FaCheckCircle className="text-green-600" />
                      )}
                      <span className="flex-1">{option}</span>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleEditQuestion(question)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? 'Edit Question' : 'Add New Question'}
          size="large"
        >
          <QuestionForm
            question={selectedQuestion}
            onSubmit={handleSubmitQuestion}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default QuestionManagement;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import quizService from '../../services/quizService';
import Loader from '../common/Loader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuizForm from './QuizForm';
import { FaEdit, FaTrash, FaEye, FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminQuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    const confirmed = window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.');
    
    if (!confirmed) return;

    try {
      await quizService.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      toast.error(error || 'Failed to delete quiz');
    }
  };

  const handleSubmitQuiz = async (quizData) => {
    try {
      if (isEditing && selectedQuiz) {
        await quizService.updateQuiz(selectedQuiz.id, quizData);
      } else {
        await quizService.createQuiz(quizData);
      }
      setShowModal(false);
      fetchQuizzes();
    } catch (error) {
      throw error;
    }
  };

  const handleManageQuestions = (quizId) => {
    navigate(`/admin/quiz/${quizId}/questions`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Quizzes</h2>
        <Button
          variant="primary"
          onClick={handleCreateQuiz}
          className="flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create New Quiz</span>
        </Button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-xl text-gray-500 mb-4">No quizzes created yet</p>
          <Button variant="primary" onClick={handleCreateQuiz}>
            Create Your First Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quiz.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quiz.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{quiz.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FaQuestionCircle />
                        <span>{quiz.totalQuestions || 0} Questions</span>
                      </span>
                      {quiz.category && (
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {quiz.category}
                        </span>
                      )}
                      {quiz.timeLimit && (
                        <span>{quiz.timeLimit} mins</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleManageQuestions(quiz.id)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaQuestionCircle />
                    <span>Manage Questions</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEditQuiz(quiz)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaEye />
                    <span>Preview</span>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Quiz' : 'Create New Quiz'}
        size="large"
      >
        <QuizForm
          quiz={selectedQuiz}
          onSubmit={handleSubmitQuiz}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminQuizList;

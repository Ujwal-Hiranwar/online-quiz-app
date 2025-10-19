import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired } from '../../utils/validators';
import QuestionForm from './QuestionForm';
import { FaPlus } from 'react-icons/fa';

const QuizForm = ({ quiz = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficultyLevel: 'MEDIUM',
    timeLimitMinutes: '1',
    passingScore: '',
    active: true,
  });

  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        topic: quiz.topic || '',
        difficultyLevel: quiz.difficultyLevel || 'MEDIUM',
        timeLimitMinutes: quiz.timeLimitMinutes || '',
        passingScore: quiz.passingScore || '',
        active: quiz.active !== undefined ? quiz.active : true,
      });
      setQuestions(quiz.questions || []);
    }
  }, [quiz]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = 'Quiz title is required';
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = 'Description is required';
    }

    if (!validateRequired(formData.topic)) {
      newErrors.topic = 'Topic is required';
    }

    if (formData.timeLimitMinutes && (isNaN(formData.timeLimitMinutes) || formData.timeLimitMinutes <= 0)) {
      newErrors.timeLimitMinutes = 'Time limit must be a positive number';
    }

    if (formData.passingScore && (isNaN(formData.passingScore) || formData.passingScore < 0)) {
        newErrors.passingScore = 'Passing score must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      questionType: 'SINGLE_CHOICE',
      difficulty: 'MEDIUM',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ],
      explanation: '',
    }]);
  };

  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const formattedQuestions = questions.map(q => ({
        ...q,
        questionType: q.questionType,
      }));

      const submitData = {
        ...formData,
        timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : null,
        passingScore: formData.passingScore ? parseInt(formData.passingScore) : null,
        active: formData.active,
        questions: formattedQuestions,
      };

      await onSubmit(submitData);
      toast.success(quiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
    } catch (error) {
      toast.error(error || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Quiz Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        rows="3"
        className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
      />
      <Input
        label="Topic"
        name="topic"
        value={formData.topic}
        onChange={handleChange}
        error={errors.topic}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Time Limit (minutes)"
          name="timeLimitMinutes"
          type="number"
          value={formData.timeLimitMinutes}
          onChange={handleChange}
          error={errors.timeLimitMinutes}
        />
        <Input
          label="Passing Score"
          name="passingScore"
          type="number"
          value={formData.passingScore}
          onChange={handleChange}
          error={errors.passingScore}
        />
      </div>

      <div class="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Make this quiz active and visible to users
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Questions</h3>
        {questions.map((question, index) => (
          <QuestionForm
            key={index}
            question={question}
            onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
            onRemove={() => handleRemoveQuestion(index)}
          />
        ))}
        <Button type="button" variant="outline" onClick={handleAddQuestion} className="mt-2">
          <FaPlus className="inline-block mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default QuizForm;

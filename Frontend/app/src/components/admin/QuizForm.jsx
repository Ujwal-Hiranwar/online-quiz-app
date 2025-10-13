import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired } from '../../utils/validators';

const QuizForm = ({ quiz = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'MEDIUM',
    timeLimit: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || '',
        difficulty: quiz.difficulty || 'MEDIUM',
        timeLimit: quiz.timeLimit || '',
        isActive: quiz.isActive !== undefined ? quiz.isActive : true,
      });
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

    if (!validateRequired(formData.category)) {
      newErrors.category = 'Category is required';
    }

    if (formData.timeLimit && (isNaN(formData.timeLimit) || formData.timeLimit <= 0)) {
      newErrors.timeLimit = 'Time limit must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
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
      <div>
        <Input
          label="Quiz Title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter quiz title"
          error={errors.title}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter quiz description"
          rows="4"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Category"
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Science, History, Math"
            error={errors.category}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Time Limit (minutes)"
          type="number"
          name="timeLimit"
          value={formData.timeLimit}
          onChange={handleChange}
          placeholder="Leave empty for no time limit"
          error={errors.timeLimit}
        />
        <p className="text-sm text-gray-500 mt-1">
          Optional: Set a time limit for this quiz
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Make this quiz active and visible to users
        </label>
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

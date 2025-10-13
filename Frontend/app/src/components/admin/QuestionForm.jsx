import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired } from '../../utils/validators';
import { FaPlus, FaTrash } from 'react-icons/fa';

const QuestionForm = ({ question = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    type: 'SINGLE_CHOICE',
    difficulty: 'MEDIUM',
    options: ['', '', '', ''],
    correctAnswers: [],
    explanation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        type: question.type || 'SINGLE_CHOICE',
        difficulty: question.difficulty || 'MEDIUM',
        options: question.options || ['', '', '', ''],
        correctAnswers: question.correctAnswers || [],
        explanation: question.explanation || '',
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('A question must have at least 2 options');
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    const newCorrectAnswers = formData.correctAnswers
      .filter(ans => ans !== index)
      .map(ans => ans > index ? ans - 1 : ans);
    
    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    }));
  };

  const handleCorrectAnswerToggle = (index) => {
    if (formData.type === 'SINGLE_CHOICE') {
      setFormData(prev => ({
        ...prev,
        correctAnswers: [index]
      }));
    } else {
      const newCorrectAnswers = formData.correctAnswers.includes(index)
        ? formData.correctAnswers.filter(ans => ans !== index)
        : [...formData.correctAnswers, index];
      
      setFormData(prev => ({
        ...prev,
        correctAnswers: newCorrectAnswers
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.questionText)) {
      newErrors.questionText = 'Question text is required';
    }

    const filledOptions = formData.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (formData.correctAnswers.length === 0) {
      newErrors.correctAnswers = 'Please select at least one correct answer';
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
        options: formData.options.filter(opt => opt.trim() !== ''),
      };

      await onSubmit(submitData);
      toast.success(question ? 'Question updated successfully!' : 'Question added successfully!');
    } catch (error) {
      toast.error(error || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          name="questionText"
          value={formData.questionText}
          onChange={handleChange}
          placeholder="Enter your question"
          rows="3"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            errors.questionText ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.questionText && (
          <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.type === 'SINGLE_CHOICE' 
              ? 'User can select only one option' 
              : 'User can select multiple options'}
          </p>
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Options <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="text-sm flex items-center space-x-1"
          >
            <FaPlus />
            <span>Add Option</span>
          </Button>
        </div>

        {errors.options && (
          <p className="text-red-500 text-sm mb-2">{errors.options}</p>
        )}

        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type={formData.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                checked={formData.correctAnswers.includes(index)}
                onChange={() => handleCorrectAnswerToggle(index)}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                title="Mark as correct answer"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        {errors.correctAnswers && (
          <p className="text-red-500 text-sm mt-2">{errors.correctAnswers}</p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Check the {formData.type === 'SINGLE_CHOICE' ? 'radio button' : 'checkbox(es)'} to mark correct answer(s)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explanation (Optional)
        </label>
        <textarea
          name="explanation"
          value={formData.explanation}
          onChange={handleChange}
          placeholder="Provide an explanation for the correct answer"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be shown to users after they submit their answer
        </p>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
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

export default QuestionForm;

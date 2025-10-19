import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired } from '../../utils/validators';
import { FaPlus, FaTrash } from 'react-icons/fa';

const QuestionForm = ({ question = null, onSubmit, onCancel, showButtons = false, onChange, onRemove }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'SINGLE_CHOICE',
    points: 1,
    explanation: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  });
  const [errors, setErrors] = useState({});
  const handleDataChange = (newFormData) => {
    setFormData(newFormData);
    if (onChange) {
      onChange(newFormData);
    }
  };

  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        questionType: question.questionType || 'SINGLE_CHOICE',
        points: question.points || 1,
        explanation: question.explanation || '',
        options: question.options && question.options.length > 0 ? question.options : [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    handleDataChange(newFormData);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    handleDataChange({ ...formData, options: newOptions });
  };

  const addOption = () => {
    handleDataChange({
      ...formData,
      options: [...formData.options, { optionText: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('A question must have at least 2 options');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    handleDataChange({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerToggle = (index) => {
    const newOptions = [...formData.options];
    if (formData.questionType === 'SINGLE_CHOICE') {
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    } else {
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    }
    handleDataChange({ ...formData, options: newOptions });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateRequired(formData.questionText)) {
      newErrors.questionText = 'Question text is required';
    }
    const hasAtLeastTwoOptions = formData.options.filter(opt => validateRequired(opt.optionText)).length >= 2;
    if (!hasAtLeastTwoOptions) {
      newErrors.options = 'At least 2 options with text are required';
    }
    const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      newErrors.correctAnswer = 'At least one option must be marked as correct';
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
      await onSubmit(formData);
    } catch (error) {
      // Error is handled by the parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border p-4 rounded-lg relative">
      {onRemove && (
        <Button type="button" variant="danger" onClick={onRemove} className="absolute top-2 right-2">
          <FaTrash />
        </Button>
      )}
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
        {errors.questionText && <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type <span className="text-red-500">*</span>
          </label>
          <select
            name="questionType"
            value={formData.questionType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          </select>
        </div>
        <Input
          label="Points"
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          placeholder="Points for this question"
        />
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
        {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
        {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}

        <div className="space-y-3 mt-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type={formData.questionType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                name={`correctAnswer-${formData.questionType === 'SINGLE_CHOICE' ? 'group' : index}`}
                checked={option.isCorrect}
                onChange={() => handleCorrectAnswerToggle(index)}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                title="Mark as correct answer"
              />
              <Input
                type="text"
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {formData.options.length > 2 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeOption(index)}
                  className="p-2"
                >
                  <FaTrash />
                </Button>
              )}
            </div>
          ))}
        </div>
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
      </div>
      
      {showButtons && (
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : (question ? 'Update Question' : 'Add Question')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default QuestionForm;

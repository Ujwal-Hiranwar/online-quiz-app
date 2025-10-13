import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const QuestionDisplay = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect,
  showResult = false,
  correctAnswer = null
}) => {
  const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';

  const handleOptionClick = (optionIndex) => {
    if (showResult) return;

    if (isMultipleChoice) {
      const currentAnswers = selectedAnswer || [];
      if (currentAnswers.includes(optionIndex)) {
        onAnswerSelect(currentAnswers.filter(idx => idx !== optionIndex));
      } else {
        onAnswerSelect([...currentAnswers, optionIndex]);
      }
    } else {
      onAnswerSelect(optionIndex);
    }
  };

  const isOptionSelected = (optionIndex) => {
    if (isMultipleChoice) {
      return selectedAnswer?.includes(optionIndex) || false;
    }
    return selectedAnswer === optionIndex;
  };

  const getOptionStyle = (optionIndex) => {
    const baseStyle = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
    
    if (showResult) {
      const isCorrect = isMultipleChoice 
        ? correctAnswer?.includes(optionIndex)
        : correctAnswer === optionIndex;
      
      if (isCorrect) {
        return baseStyle + "bg-green-50 border-green-500 text-green-900";
      }
      if (isOptionSelected(optionIndex) && !isCorrect) {
        return baseStyle + "bg-red-50 border-red-500 text-red-900";
      }
      return baseStyle + "bg-gray-50 border-gray-300 text-gray-600";
    }

    if (isOptionSelected(optionIndex)) {
      return baseStyle + "bg-primary border-primary text-white hover:bg-indigo-700";
    }
    
    return baseStyle + "bg-white border-gray-300 text-gray-900 hover:border-primary hover:bg-blue-50";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            question.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.questionText}
        </h2>
        {isMultipleChoice && (
          <p className="text-sm text-gray-600">
            (Select all that apply)
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={showResult}
            className={getOptionStyle(index)}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1">{option}</span>
              {showResult && (
                <span>
                  {(isMultipleChoice ? correctAnswer?.includes(index) : correctAnswer === index) ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : isOptionSelected(index) ? (
                    <FaTimesCircle className="text-red-600" />
                  ) : null}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation (if shown after answer) */}
      {showResult && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;

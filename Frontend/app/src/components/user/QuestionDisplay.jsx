import React from 'react';
import Button from '../common/Button';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  answerState, // { selection: [], result: null } or { selection: [1], result: { ... } }
  onSelectionChange,
  onAnswerSubmit,
}) => {

  const isAnswered = !!answerState?.result;
  const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE';

  const handleOptionClick = (optionId) => {
    if (isAnswered) return;

    let newSelection;
    if (isMultipleChoice) {
      const currentSelection = answerState?.selection || [];
      if (currentSelection.includes(optionId)) {
        newSelection = currentSelection.filter(id => id !== optionId);
      } else {
        newSelection = [...currentSelection, optionId];
      }
    } else {
      newSelection = [optionId];
    }
    onSelectionChange(question.id, newSelection);
  };

  const getOptionStyle = (option) => {
    const baseStyle = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
    const isSelected = answerState?.selection?.includes(option.id);

    if (isAnswered) {
      if (answerState.result.selectedOptionIds.includes(option.id)) {
        return answerState.result.isCorrect 
            ? baseStyle + "bg-green-100 border-green-500 text-green-900 ring-2 ring-green-500"
            : baseStyle + "bg-red-100 border-red-500 text-red-900 ring-2 ring-red-500";
      } else if (option.isCorrect) {
        // Show the correct answer if the user missed it
        return baseStyle + "bg-green-50 border-green-400 text-green-800";
      }
    } else {
        if (isSelected) {
            return baseStyle + "bg-primary border-primary text-white";
        }
    }
    
    return baseStyle + "bg-white border-gray-300 text-gray-900 hover:border-primary hover:bg-blue-50";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 my-2">
          {question.questionText}
        </h2>
        {isMultipleChoice && (
          <p className="text-sm text-gray-600">
            (Select all that apply)
          </p>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={isAnswered}
            className={getOptionStyle(option)}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1 text-left">{option.optionText}</span>
              {isAnswered && answerState.result.selectedOptionIds.includes(option.id) && (
                <span>
                  {answerState.result.isCorrect ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaTimesCircle className="text-red-600" />
                  )}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {!isAnswered ? (
        <div className="mt-6">
          <Button 
            onClick={() => onAnswerSubmit(question.id)}
            disabled={!answerState?.selection || answerState.selection.length === 0}
            fullWidth
          >
            Submit Answer
          </Button>
        </div>
      ) : question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h4 className="font-bold text-blue-900">Explanation</h4>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;


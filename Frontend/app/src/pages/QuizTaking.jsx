import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import quizService from '../services/quizService';
import QuestionDisplay from '../components/user/QuestionDisplay';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaClock, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { formatTime } from '../utils/helpers';

const QuizTaking = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [answers, setAnswers] = useState({}); // Stores { selection, result } for each questionId
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCompleteQuiz = useCallback(async (force = false) => {
        if (isSubmitting) return;

        const answeredCount = Object.values(answers).filter(a => a.result).length;
        if (!force && answeredCount < questions.length) {
            const confirmed = window.confirm(
                `You have not answered all questions. Do you want to submit anyway?`
            );
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        try {
            const result = await quizService.completeQuiz(attemptId);
            toast.success('Quiz completed successfully!');
            navigate(`/quiz/${quizId}/result`, { state: { result } });
        } catch (error) {
            toast.error(error || 'Failed to complete quiz');
            setIsSubmitting(false);
        }
    }, [attemptId, answers, questions, isSubmitting, navigate, quizId]);

    useEffect(() => {
        const startNewQuiz = async () => {
            try {
                setLoading(true);
                const attempt = await quizService.startQuiz(quizId);
                setAttemptId(attempt.id);
                setQuiz({ title: attempt.quizTitle });
                setQuestions(attempt.questions);
                if (attempt.timeLimitMinutes) {
                    setTimeRemaining(attempt.timeLimitMinutes * 60);
                }
            } catch (error) {
                toast.error(error || 'Failed to start quiz');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        startNewQuiz();
    }, [quizId, navigate]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleCompleteQuiz(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, handleCompleteQuiz]);

    const handleSelectionChange = (questionId, selection) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], selection },
        }));
    };

    const handleAnswerSubmit = async (questionId) => {
        const answer = answers[questionId];
        if (!answer || !answer.selection || answer.selection.length === 0) {
            toast.warn('Please select an option first.');
            return;
        }

        try {
            const result = await quizService.submitAnswer({
                attemptId,
                questionId,
                selectedOptionIds: answer.selection,
            });
            setAnswers(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], result },
            }));
            toast.success(result.isCorrect ? 'Correct!' : 'Incorrect.', { autoClose: 1500 });
        } catch (error) {
            toast.error(error || 'Failed to submit answer');
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (loading) {
        return <Loader fullScreen size="large" text="Preparing Your Quiz..." />;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = (Object.values(answers).filter(a => a.result).length / questions.length) * 100;
    const isCurrentQuestionAnswered = !!answers[currentQuestion?.id]?.result;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">{quiz?.title}</h1>
                        {timeRemaining !== null && (
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                <FaClock />
                                <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Progress: {Object.values(answers).filter(a => a.result).length} / {questions.length}</p>
                </div>

                {currentQuestion && (
                    <QuestionDisplay
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        answerState={answers[currentQuestion.id]}
                        onSelectionChange={handleSelectionChange}
                        onAnswerSubmit={handleAnswerSubmit}
                    />
                )}

                <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex items-center space-x-2">
                        <FaArrowLeft />
                        <span>Previous</span>
                    </Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button variant="secondary" onClick={() => handleCompleteQuiz(false)} disabled={!isCurrentQuestionAnswered || isSubmitting} className="flex items-center space-x-2">
                            <FaCheck />
                            <span>{isSubmitting ? 'Finishing...' : 'Finish Quiz'}</span>
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={handleNext} disabled={!isCurrentQuestionAnswered} className="flex items-center space-x-2">
                            <span>Next</span>
                            <FaArrowRight />
                        </Button>
                    )}
                </div>

                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`aspect-square rounded-lg font-medium transition-colors ${
                                    index === currentQuestionIndex
                                        ? 'border-2 border-primary bg-blue-100'
                                        : answers[q.id]?.result
                                            ? answers[q.id].result.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTaking;

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

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitQuiz = useCallback(async () => {
        if (!attemptId) return;

        setIsSubmitting(true);
        try {
            const result = await quizService.completeQuiz(attemptId);
            toast.success('Quiz submitted successfully!');
            navigate(`/quiz/${quizId}/result`, { state: { result: result.data } });
        } catch (error) {
            toast.error(error || 'Failed to submit quiz');
            setIsSubmitting(false);
        }
    }, [attemptId, quizId, navigate]);

    useEffect(() => {
        const startNewQuiz = async () => {
            try {
                setLoading(true);
                const [quizData, questionsData, attemptData] = await Promise.all([
                    quizService.getQuizById(quizId),
                    quizService.getQuizQuestions(quizId),
                    quizService.startQuiz(quizId)
                ]);
                setQuiz(quizData.data);
                setQuestions(questionsData.data);
                setAttemptId(attemptData.data.id);
                if (quizData.data.timeLimitMinutes) {
                    setTimeRemaining(quizData.data.timeLimitMinutes * 60);
                }
            } catch (error) {
                toast.error(error || 'Failed to load quiz');
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
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, handleSubmitQuiz]);

    const handleAnswerSelect = async (answer) => {
        const questionId = questions[currentQuestionIndex].id;
        const selectedOptionIds = Array.isArray(answer) ? answer.map(i => questions[currentQuestionIndex].options[i].id) : [questions[currentQuestionIndex].options[answer].id];

        setAnswers({
            ...answers,
            [questionId]: answer
        });

        try {
            await quizService.submitAnswer({
                attemptId,
                questionId,
                selectedOptionIds,
            });
            toast.info('Answer saved!');
        } catch (error) {
            toast.error(error || 'Failed to save answer');
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

    if (loading || !quiz) {
        return <Loader fullScreen />;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                            <p className="text-gray-600">{quiz.description}</p>
                        </div>
                        {timeRemaining !== null && (
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                <FaClock />
                                <span className="font-mono text-lg font-bold">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Progress: {currentQuestionIndex + 1} / {questions.length}
                    </p>
                </div>

                <QuestionDisplay
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    selectedAnswer={answers[currentQuestion.id]}
                    onAnswerSelect={handleAnswerSelect}
                />

                <div className="mt-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center space-x-2"
                    >
                        <FaArrowLeft />
                        <span>Previous</span>
                    </Button>

                    <div className="flex space-x-3">
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                variant="secondary"
                                onClick={handleSubmitQuiz}
                                disabled={isSubmitting}
                                className="flex items-center space-x-2"
                            >
                                <FaCheck />
                                <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                className="flex items-center space-x-2"
                            >
                                <span>Next</span>
                                <FaArrowRight />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`aspect-square rounded-lg font-medium transition-colors ${index === currentQuestionIndex
                                        ? 'bg-primary text-white'
                                        : answers[q.id] !== undefined
                                            ? 'bg-secondary text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-secondary rounded"></div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary rounded"></div>
                            <span>Current</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <span>Unanswered</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTaking;

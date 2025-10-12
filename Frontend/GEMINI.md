# Online Quiz Application - Frontend Development Plan (React + Tailwind CSS)

**Project ID:** 65HIBKJS  
**Frontend Stack:** React.js with Tailwind CSS  
**Backend:** Spring Boot REST API (MySQL Database)  
**Timeline:** 25 Days

---

## Phase 1: Project Setup and Configuration (Days 1-2)

### Step 1.1: Create React Application

```bash
npx create-react-app online-quiz-frontend
cd online-quiz-frontend
```

### Step 1.2: Install Required Dependencies

```bash
npm install react-router-dom axios tailwindcss postcss autoprefixer
npm install react-icons
npm install jwt-decode
npm install react-toastify
```

### Step 1.3: Configure Tailwind CSS

Initialize Tailwind:
```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Global styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}
```

### Step 1.4: Create Project Folder Structure

Create the following folder structure inside `src/`:

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── SignupForm.jsx
│   ├── admin/
│   │   ├── QuizForm.jsx
│   │   ├── QuestionForm.jsx
│   │   ├── QuizList.jsx
│   │   └── AdminDashboard.jsx
│   ├── user/
│   │   ├── QuizCard.jsx
│   │   ├── QuizList.jsx
│   │   ├── QuestionDisplay.jsx
│   │   ├── QuizResult.jsx
│   │   └── UserDashboard.jsx
│   └── leaderboard/
│       └── Leaderboard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── AdminDashboard.jsx
│   ├── UserDashboard.jsx
│   ├── QuizTaking.jsx
│   ├── QuizHistory.jsx
│   ├── LeaderboardPage.jsx
│   └── NotFound.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── quizService.js
│   └── userService.js
├── context/
│   └── AuthContext.jsx
├── utils/
│   ├── constants.js
│   ├── validators.js
│   └── helpers.js
├── hooks/
│   ├── useAuth.js
│   └── useQuiz.js
├── App.jsx
└── index.js
```

### Step 1.5: Create Environment Configuration

Create `.env` file in root directory:
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=Online Quiz Application
```

---

## Phase 2: Setup API Configuration and Authentication Context (Days 2-3)

### Step 2.1: Create API Configuration File

Create `src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2.2: Create Authentication Service

Create `src/services/authService.js`:
```javascript
import api from './api';
import { jwtDecode } from 'jwt-decode';

const authService = {
  // Register new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Signup failed';
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  },
};

export default authService;
```

### Step 2.3: Create Quiz Service

Create `src/services/quizService.js`:
```javascript
import api from './api';

const quizService = {
  // Get all quizzes
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quizzes';
    }
  },

  // Get quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quiz';
    }
  },

  // Create new quiz (Admin only)
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create quiz';
    }
  },

  // Update quiz (Admin only)
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update quiz';
    }
  },

  // Delete quiz (Admin only)
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete quiz';
    }
  },

  // Get questions for a quiz
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch questions';
    }
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to submit quiz';
    }
  },

  // Get user quiz history
  getUserQuizHistory: async () => {
    try {
      const response = await api.get('/users/quiz-history');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quiz history';
    }
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch leaderboard';
    }
  },

  // Get overall leaderboard
  getOverallLeaderboard: async () => {
    try {
      const response = await api.get('/leaderboard');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch leaderboard';
    }
  },
};

export default quizService;
```

### Step 2.4: Create User Service

Create `src/services/userService.js`:
```javascript
import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch statistics';
    }
  },
};

export default userService;
```

### Step 2.5: Create Utility Files

Create `src/utils/constants.js`:
```javascript
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const QUIZ_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
};

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};
```

Create `src/utils/validators.js`:
```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};
```

Create `src/utils/helpers.js`:
```javascript
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculatePercentage = (score, total) => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
```

### Step 2.6: Create Authentication Context

Create `src/context/AuthContext.jsx`:
```javascript
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Step 2.7: Create Custom Hooks

Create `src/hooks/useAuth.js`:
```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

Create `src/hooks/useQuiz.js`:
```javascript
import { useState, useEffect } from 'react';
import quizService from '../services/quizService';

export const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      const questionsData = await quizService.getQuizQuestions(quizId);
      setQuiz(quizData);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  return { quiz, questions, loading, error, refetch: fetchQuiz };
};
```

---

## Phase 3: Build Common Components (Days 3-5)

### Step 3.1: Create Button Component

Create `src/components/common/Button.jsx`:
```javascript
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = '',
  fullWidth = false 
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 focus:ring-primary disabled:bg-gray-400',
    secondary: 'bg-secondary text-white hover:bg-green-700 focus:ring-secondary disabled:bg-gray-400',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger disabled:bg-gray-400',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-400 disabled:text-gray-400',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Step 3.2: Create Input Component

Create `src/components/common/Input.jsx`:
```javascript
import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  error = '',
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
```

### Step 3.3: Create Loader Component

Create `src/components/common/Loader.jsx`:
```javascript
import React from 'react';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };

  const loader = (
    <div className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {loader}
    </div>
  );
};

export default Loader;
```

### Step 3.4: Create Modal Component

Create `src/components/common/Modal.jsx`:
```javascript
import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

### Step 3.5: Create Navbar Component

Create `src/components/common/Navbar.jsx`:
```javascript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaTrophy } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-xl font-bold text-gray-800">QuizApp</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin() ? '/admin/dashboard' : '/dashboard'}
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <FaTrophy />
                  <span>Leaderboard</span>
                </Link>
                <div className="flex items-center space-x-3 border-l pl-4">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                    {isAdmin() && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">Admin</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                    {isAdmin() && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">Admin</span>
                    )}
                  </div>
                </div>
                <Link
                  to={isAdmin() ? '/admin/dashboard' : '/dashboard'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
```

### Step 3.6: Create Footer Component

Create `src/components/common/Footer.jsx`:
```javascript
import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About QuizApp</h3>
            <p className="text-gray-400 text-sm">
              An interactive online quiz platform designed to help users test their knowledge 
              across various topics. Track your progress, compete on leaderboards, and improve your skills.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} QuizApp. All rights reserved. | Project ID: 65HIBKJS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

### Step 3.7: Update App.jsx with Routes and Context

Update `src/App.jsx`:
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages (will be created in next phases)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizTaking from './pages/QuizTaking';
import QuizHistory from './pages/QuizHistory';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFound from './pages/NotFound';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <QuizTaking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-history"
                element={
                  <ProtectedRoute>
                    <QuizHistory />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### Step 3.8: Create Protected Route Components

Create `src/components/ProtectedRoute.jsx`:
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './common/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

Create `src/components/AdminRoute.jsx`:
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './common/Loader';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
```

### Step 3.9: Update index.js

Update `src/index.js`:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Phase 4: Authentication Pages (Days 5-7)

### Step 4.1: Create Login Form Component

Create `src/components/auth/LoginForm.jsx`:
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateEmail, validateRequired } from '../../utils/validators';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = 'Password is required';
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
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success('Login successful!');
      
      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          error={errors.email}
          required
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
```

### Step 4.2: Create Signup Form Component

Create `src/components/auth/SignupForm.jsx`:
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateEmail, validatePassword, validateUsername, validateRequired } from '../../utils/validators';

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = 'Full name is required';
    }

    if (!validateRequired(formData.username)) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
    }

    if (!validateRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.fullName}
          required
        />
      </div>

      <div>
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          error={errors.username}
          required
        />
      </div>

      <div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          error={errors.email}
          required
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          error={errors.password}
          required
        />
      </div>

      <div>
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
        />
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
```

### Step 4.3: Create Login Page

Create `src/pages/Login.jsx`:
```javascript
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import { FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-5xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-indigo-700 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### Step 4.4: Create Signup Page

Create `src/pages/Signup.jsx`:
```javascript
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import { FaUserPlus } from 'react-icons/fa';

const Signup = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-green-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                <FaUserPlus className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us and start your quiz journey
            </p>
          </div>

          {/* Signup Form */}
          <SignupForm />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-secondary hover:text-green-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
```

### Step 4.5: Create Home Page

Create `src/pages/Home.jsx`:
```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaRocket, FaTrophy, FaChartLine, FaUsers } from 'react-icons/fa';
import Button from '../components/common/Button';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <FaRocket className="text-4xl text-primary" />,
      title: 'Interactive Quizzes',
      description: 'Engage with dynamic multiple-choice questions across various topics',
    },
    {
      icon: <FaTrophy className="text-4xl text-warning" />,
      title: 'Leaderboards',
      description: 'Compete with others and track your ranking on global leaderboards',
    },
    {
      icon: <FaChartLine className="text-4xl text-secondary" />,
      title: 'Progress Tracking',
      description: 'Monitor your performance and improvement over time',
    },
    {
      icon: <FaUsers className="text-4xl text-indigo-600" />,
      title: 'Community Learning',
      description: 'Join a community of learners and challenge yourself',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to QuizApp
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Test your knowledge, track your progress, and compete with others
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup">
                    <Button variant="secondary" className="px-8 py-3 text-lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="px-8 py-3 text-lg bg-white text-primary border-white hover:bg-gray-100">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={isAdmin() ? '/admin/dashboard' : '/dashboard'}>
                  <Button variant="secondary" className="px-8 py-3 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuizApp?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to enhance your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-xl text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">100+</div>
              <div className="text-xl text-gray-600">Quizzes Available</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-warning mb-2">10K+</div>
              <div className="text-xl text-gray-600">Questions Answered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-primary to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Quiz Journey?
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of learners and test your knowledge today
            </p>
            <Link to="/signup">
              <Button variant="secondary" className="px-8 py-3 text-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
```

### Step 4.6: Create Not Found Page

Create `src/pages/NotFound.jsx`:
```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <FaExclamationTriangle className="text-9xl text-warning mx-auto mb-8" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link to="/">
          <Button variant="primary" className="px-8 py-3">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
```

---

## Summary of Phase 4

In Phase 4, you have successfully created:

1. **Authentication Forms:**
   - LoginForm component with email/password validation
   - SignupForm component with complete user registration fields
   - Client-side validation for all inputs
   - Error handling and display

2. **Authentication Pages:**
   - Login page with attractive UI and gradient background
   - Signup page with user-friendly design
   - Automatic redirection for logged-in users
   - Links between login and signup pages

3. **Public Pages:**
   - Home page with hero section, features, stats, and CTA
   - NotFound (404) page for invalid routes

4. **Features Implemented:**
   - Form validation (email, password, username)
   - Loading states during API calls
   - Toast notifications for success/error messages
   - Responsive design for all screen sizes
   - Proper navigation based on user role (Admin/User)

---

## Phase 5: User Dashboard and Quiz Features (Days 7-12)

### Step 5.1: Create Quiz Card Component

Create `src/components/user/QuizCard.jsx`:
```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaPlayCircle } from 'react-icons/fa';
import Button from '../common/Button';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Quiz Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
        <p className="text-indigo-100 text-sm">{quiz.category || 'General'}</p>
      </div>

      {/* Quiz Details */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {quiz.description || 'Test your knowledge with this exciting quiz!'}
        </p>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <FaQuestionCircle className="text-primary" />
            <span>{quiz.totalQuestions || 0} Questions</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center space-x-2">
              <FaClock className="text-secondary" />
              <span>{quiz.timeLimit} mins</span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            quiz.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
            quiz.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {quiz.difficulty || 'MEDIUM'}
          </span>
        </div>

        {/* Start Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleStartQuiz}
          className="flex items-center justify-center space-x-2"
        >
          <FaPlayCircle />
          <span>Start Quiz</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;
```

### Step 5.2: Create Quiz List Component for Users

Create `src/components/user/QuizList.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import quizService from '../../services/quizService';
import QuizCard from './QuizCard';
import Loader from '../common/Loader';
import { FaSearch } from 'react-icons/fa';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, selectedDifficulty, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'ALL') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedDifficulty('EASY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'EASY'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setSelectedDifficulty('MEDIUM')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'MEDIUM'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedDifficulty('HARD')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDifficulty === 'HARD'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hard
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No quizzes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
```

### Step 5.3: Create User Dashboard Component

Create `src/components/user/UserDashboard.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import Loader from '../common/Loader';
import { FaTrophy, FaChartLine, FaClipboardList, FaMedal } from 'react-icons/fa';

const UserDashboardComponent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserStats();
      setStats(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const statCards = [
    {
      title: 'Quizzes Taken',
      value: stats?.totalQuizzesTaken || 0,
      icon: <FaClipboardList className="text-4xl text-primary" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Score',
      value: `${stats?.averageScore || 0}%`,
      icon: <FaChartLine className="text-4xl text-secondary" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Best Score',
      value: `${stats?.bestScore || 0}%`,
      icon: <FaTrophy className="text-4xl text-warning" />,
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Points',
      value: stats?.totalPoints || 0,
      icon: <FaMedal className="text-4xl text-red-500" />,
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaClipboardList />
            <span>Browse Quizzes</span>
          </Link>
          <Link
            to="/quiz-history"
            className="flex items-center justify-center space-x-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaChartLine />
            <span>View History</span>
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center space-x-2 bg-warning text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <FaTrophy />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentQuizzes && stats.recentQuizzes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentQuizzes.map((quiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{quiz.quizTitle}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(quiz.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    quiz.score >= 80 ? 'text-green-600' :
                    quiz.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {quiz.score}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {quiz.correctAnswers}/{quiz.totalQuestions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardComponent;
```

### Step 5.4: Create User Dashboard Page

Create `src/pages/UserDashboard.jsx`:
```javascript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserDashboardComponent from '../components/user/UserDashboard';
import QuizList from '../components/user/QuizList';
import { FaHome, FaClipboardList } from 'react-icons/fa';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">Ready to test your knowledge today?</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaHome />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaClipboardList />
              <span>Available Quizzes</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <UserDashboardComponent />}
          {activeTab === 'quizzes' && <QuizList />}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
```

### Step 5.5: Create Question Display Component

Create `src/components/user/QuestionDisplay.jsx`:
```javascript
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
```

### Step 5.6: Create Quiz Taking Page

Create `src/pages/QuizTaking.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.timeLimit && timeRemaining === null) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

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
      toast.error(error || 'Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: answer
    });
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

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    
    if (unansweredQuestions.length > 0) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        selectedOptions: Array.isArray(answer) ? answer : [answer]
      }));

      const result = await quizService.submitQuiz(quizId, formattedAnswers);
      
      toast.success('Quiz submitted successfully!');
      navigate(`/quiz/${quizId}/result`, { state: { result } });
    } catch (error) {
      toast.error(error || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            {timeRemaining !== null && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <FaClock />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
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

        {/* Question Display */}
        <QuestionDisplay
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerSelect={handleAnswerSelect}
        />

        {/* Navigation Buttons */}
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

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`aspect-square rounded-lg font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-white'
                    : answers[questions[index].id] !== undefined
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
```

### Step 5.7: Create Quiz Result Component

Create `src/components/user/QuizResult.jsx`:
```javascript
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrophy, FaCheckCircle, FaTimesCircle, FaChartPie, FaHome, FaRedo } from 'react-icons/fa';
import Button from '../common/Button';
import { calculatePercentage, getScoreColor } from '../../utils/helpers';

const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    navigate('/dashboard');
    return null;
  }

  const percentage = calculatePercentage(result.score, result.totalQuestions);
  const scoreColorClass = getScoreColor(percentage);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: 'Outstanding!', emoji: '🌟' };
    if (percentage >= 80) return { message: 'Excellent!', emoji: '🎉' };
    if (percentage >= 70) return { message: 'Great Job!', emoji: '👏' };
    if (percentage >= 60) return { message: 'Good Effort!', emoji: '👍' };
    return { message: 'Keep Practicing!', emoji: '💪' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 text-white text-center">
            <div className="text-6xl mb-4">{performance.emoji}</div>
            <h1 className="text-4xl font-bold mb-2">{performance.message}</h1>
            <p className="text-xl text-indigo-100">Quiz Completed!</p>
          </div>

          {/* Score Display */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`text-7xl font-bold ${scoreColorClass} mb-4`}>
                {percentage}%
              </div>
              <p className="text-2xl text-gray-600">
                {result.score} out of {result.totalQuestions} correct
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600">{result.score}</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 text-center">
                <FaTimesCircle className="text-4xl text-red-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Incorrect Answers</p>
                <p className="text-3xl font-bold text-red-600">
                  {result.totalQuestions - result.score}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <FaChartPie className="text-4xl text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
              </div>
            </div>

            {/* Time taken (if available) */}
            {result.timeTaken && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 text-center">
                <p className="text-gray-600">
                  Time Taken: <span className="font-bold text-gray-900">{result.timeTaken}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center space-x-2"
              >
                <FaHome />
                <span>Back to Dashboard</span>
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/quiz/${result.quizId}`)}
                className="flex items-center justify-center space-x-2"
              >
                <FaRedo />
                <span>Retake Quiz</span>
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/leaderboard')}
                className="flex items-center justify-center space-x-2"
              >
                <FaTrophy />
                <span>View Leaderboard</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-6 text-center text-gray-600">
          <p>
            {percentage >= 80
              ? "Keep up the excellent work! You're doing great!"
              : percentage >= 60
              ? "Good job! Keep practicing to improve your score!"
              : "Don't give up! Practice makes perfect!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
```

### Step 5.8: Create Quiz History Page

Create `src/pages/QuizHistory.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import quizService from '../services/quizService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaChartLine, FaCalendar, FaRedo } from 'react-icons/fa';
import { formatDate, calculatePercentage, getScoreColor } from '../utils/helpers';

const QuizHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await quizService.getUserQuizHistory();
      setHistory(data);
    } catch (error) {
      toast.error(error || 'Failed to fetch quiz history');
    } finally {
      setLoading(false);
    }
  };
              <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Failed ({history.filter(h => calculatePercentage(h.score, h.totalQuestions) < 60).length})
            </button>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-4">No quiz history found</p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Take Your First Quiz
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredHistory.map((item, index) => {
              const percentage = calculatePercentage(item.score, item.totalQuestions);
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.quizTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center space-x-1">
                          <FaCalendar />
                          <span>{formatDate(item.completedAt)}</span>
                        </span>
                        {item.timeTaken && (
                          <span>Time: {item.timeTaken}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Score: {item.score}/{item.totalQuestions}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage >= 60 ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(percentage)} mb-2`}>
                        {percentage}%
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/quiz/${item.quizId}`)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <FaRedo />
                        <span>Retake</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
```

---

## Summary of Phase 5

In Phase 5, you have successfully created:

1. **Quiz Display Components:**
   - QuizCard component with quiz details and difficulty badges
   - QuizList component with search and filter functionality
   - Question navigator for easy navigation between questions

2. **User Dashboard:**
   - UserDashboard component with statistics display
   - Stats cards showing quizzes taken, average score, best score, and points
   - Quick actions for navigation
   - Recent activity display

3. **Quiz Taking Interface:**
   - QuestionDisplay component supporting single and multiple choice
   - QuizTaking page with timer functionality
   - Progress bar and question navigator
   - Auto-submit when time runs out

4. **Quiz Results and History:**
   - QuizResult component with performance analysis
   - Visual statistics with icons and colors
   - QuizHistory page with filtering options
   - Action buttons for retaking quiz or returning to dashboard

---

## Phase 6: Admin Dashboard and Quiz Management (Days 12-17)

### Step 6.1: Create Quiz Form Component

Create `src/components/admin/QuizForm.jsx`:
```javascript
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
```

### Step 6.2: Create Question Form Component

Create `src/components/admin/QuestionForm.jsx`:
```javascript
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
```

### Step 6.3: Create Admin Quiz List Component

Create `src/components/admin/QuizList.jsx`:
```javascript
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
```

### Step 6.4: Create Question Management Page

Create `src/pages/QuestionManagement.jsx`:
```javascript
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
```

### Step 6.5: Create Admin Dashboard Component

Create `src/components/admin/AdminDashboard.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';
import { FaClipboardList, FaUsers, FaQuestionCircle, FaChartLine } from 'react-icons/fa';

const AdminDashboardComponent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const statCards = [
    {
      title: 'Total Quizzes',
      value: stats?.totalQuizzes || 0,
      icon: <FaClipboardList className="text-4xl text-primary" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-primary',
    },
    {
      title: 'Total Questions',
      value: stats?.totalQuestions || 0,
      icon: <FaQuestionCircle className="text-4xl text-secondary" />,
      bgColor: 'bg-green-50',
      textColor: 'text-secondary',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FaUsers className="text-4xl text-warning" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-warning',
    },
    {
      title: 'Total Attempts',
      value: stats?.totalAttempts || 0,
      icon: <FaChartLine className="text-4xl text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{activity.userName}</p>
                  <p className="text-sm text-gray-600">
                    Completed: {activity.quizTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    activity.score >= 80 ? 'text-green-600' :
                    activity.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {activity.score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardComponent;
```

### Step 6.6: Create Admin Dashboard Page

Create `src/pages/AdminDashboard.jsx`:
```javascript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboardComponent from '../components/admin/AdminDashboard';
import AdminQuizList from '../components/admin/QuizList';
import { FaHome, FaClipboardList } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaHome />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center space-x-2 pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FaClipboardList />
              <span>Manage Quizzes</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <AdminDashboardComponent />}
          {activeTab === 'quizzes' && <AdminQuizList />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### Step 6.7: Update App.jsx with Admin Routes

Add these routes to `src/App.jsx` inside the Protected Admin Routes section:

```javascript
{/* Protected Admin Routes */}
<Route
  path="/admin/dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
<Route
  path="/admin/quiz/:quizId/questions"
  element={
    <AdminRoute>
      <QuestionManagement />
    </AdminRoute>
  }
/>
```

Import the necessary components at the top of `App.jsx`:
```javascript
import AdminDashboard from './pages/AdminDashboard';
import QuestionManagement from './pages/QuestionManagement';
```

---

## Summary of Phase 6

In Phase 6, you have successfully created:

### 1. **Quiz Management:**
   - **QuizForm Component** (`src/components/admin/QuizForm.jsx`)
     - Create and edit quiz functionality
     - Fields: title, description, category, difficulty, time limit, active status
     - Complete form validation
     - Success/error handling with toast notifications
   
   - **AdminQuizList Component** (`src/components/admin/QuizList.jsx`)
     - Display all quizzes in card format
     - CRUD operations (Create, Read, Update, Delete)
     - Modal-based quiz form
     - Preview, edit, delete, and manage questions actions
     - Active/inactive status display
     - Difficulty badges and question count

### 2. **Question Management:**
   - **QuestionForm Component** (`src/components/admin/QuestionForm.jsx`)
     - Support for single choice and multiple choice questions
     - Dynamic option management (add/remove options with minimum 2)
     - Correct answer selection via radio/checkbox
     - Question difficulty levels (Easy, Medium, Hard)
     - Optional explanation field
     - Complete validation for all fields
   
   - **QuestionManagement Page** (`src/pages/QuestionManagement.jsx`)
     - Full CRUD operations for questions
     - Display questions with their options and correct answers
     - Visual indicators for correct answers (green background with checkmark)
     - Question type and difficulty badges
     - Modal-based question form
     - Back navigation to admin dashboard

### 3. **Admin Dashboard:**
   - **AdminDashboardComponent** (`src/components/admin/AdminDashboard.jsx`)
     - Statistics cards showing:
       - Total Quizzes
       - Total Questions
       - Total Users
       - Total Attempts
     - Recent activity section with user quiz completions
     - Score-based color coding (green/yellow/red)
   
   - **AdminDashboard Page** (`src/pages/AdminDashboard.jsx`)
     - Tab-based navigation (Overview and Manage Quizzes)
     - Clean header with welcome message
     - Responsive layout for all screen sizes

### 4. **Features Implemented:**
   - ✅ Complete CRUD operations for quizzes
   - ✅ Complete CRUD operations for questions
   - ✅ Form validation for all inputs
   - ✅ Modal dialogs for forms
   - ✅ Confirmation dialogs for delete operations
   - ✅ Toast notifications for all actions (success/error)
   - ✅ Responsive design for all components
   - ✅ Active/inactive quiz status management
   - ✅ Single and multiple choice question types
   - ✅ Dynamic option management
   - ✅ Visual feedback for correct/incorrect options
   - ✅ Admin statistics dashboard
   - ✅ Recent activity tracking

### 5. **Routes Added:**
   - `/admin/dashboard` - Admin dashboard with tabs
   - `/admin/quiz/:quizId/questions` - Question management for specific quiz

---

## Testing Phase 6

### Test Cases:

1. **Quiz Management:**
   - [ ] Login as admin user
   - [ ] Navigate to Admin Dashboard
   - [ ] Click "Create New Quiz" button
   - [ ] Fill in all quiz details and submit
   - [ ] Verify quiz appears in the list
   - [ ] Click "Edit" on a quiz and modify details
   - [ ] Verify changes are saved
   - [ ] Click "Preview" to see quiz as a user would
   - [ ] Click "Delete" and confirm deletion
   - [ ] Verify quiz is removed from list

2. **Question Management:**
   - [ ] Click "Manage Questions" on a quiz
   - [ ] Verify quiz details are displayed at top
   - [ ] Click "Add Question" button
   - [ ] Create a single choice question with 4 options
   - [ ] Mark one option as correct
   - [ ] Add optional explanation
   - [ ] Submit and verify question appears
   - [ ] Create a multiple choice question
   - [ ] Mark multiple options as correct
   - [ ] Add and remove options dynamically
   - [ ] Edit an existing question
   - [ ] Delete a question with confirmation
   - [ ] Test validation (empty fields, no correct answer selected)

3. **Admin Dashboard:**
   - [ ] Verify statistics cards display correct numbers
   - [ ] Check recent activity section shows latest completions
   - [ ] Switch between "Overview" and "Manage Quizzes" tabs
   - [ ] Verify responsive design on mobile devices

4. **Error Handling:**
   - [ ] Test form validation for empty required fields
   - [ ] Test invalid time limit (negative numbers)
   - [ ] Test minimum 2 options requirement
   - [ ] Test delete confirmations (Cancel and OK)
   - [ ] Verify toast notifications appear for all actions

---

## Integration Notes

### Required Backend Endpoints:

The following API endpoints must be available from your Spring Boot backend:

**Quiz Endpoints:**
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/{id}` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/{id}` - Update quiz
- `DELETE /api/quizzes/{id}` - Delete quiz

**Question Endpoints:**
- `GET /api/quizzes/{quizId}/questions` - Get all questions for a quiz
- `POST /api/quizzes/{quizId}/questions` - Add question to quiz
- `PUT /api/quizzes/{quizId}/questions/{questionId}` - Update question
- `DELETE /api/quizzes/{quizId}/questions/{questionId}` - Delete question

**Admin Stats Endpoint:**
- `GET /api/admin/stats` - Get admin statistics

### Expected Data Models:

**Quiz Model:**
```json
{
  "id": 1,
  "title": "JavaScript Basics",
  "description": "Test your JavaScript knowledge",
  "category": "Programming",
  "difficulty": "MEDIUM",
  "timeLimit": 30,
  "isActive": true,
  "totalQuestions": 10
}
```

**Question Model:**
```json
{
  "id": 1,
  "questionText": "What is a closure?",
  "type": "SINGLE_CHOICE",
  "difficulty": "MEDIUM",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswers": [1],
  "explanation": "A closure is a function that has access to outer scope"
}
```

---

## Next Steps

After completing Phase 6, proceed to:
- **Phase 7:** Additional Features (Leaderboard, User Profile, etc.)
- **Phase 8:** Final Integration, Testing & Optimization

---

**End of Phase 6**
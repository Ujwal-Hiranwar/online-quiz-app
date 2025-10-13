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

    console.log("SIGNUP-FORM: Form data is valid. Submitting:", formData);

    setLoading(true);

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
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

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
    username: '',
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

    if (!validateRequired(formData.username)) {
      newErrors.username = 'Username is required';
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

    console.log("LOGIN-FORM: Form data is valid. Submitting:", formData);

    setLoading(true);

    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      toast.success('Login successful!');
      
      // Redirect based on user role
      if (response.role === 'ADMIN') {
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
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          error={errors.username}
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

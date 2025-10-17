import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateEmail, validatePassword, validateUsername, validateRequired } from '../../utils/validators';

const UserForm = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.firstName)) newErrors.firstName = 'First name is required';
    if (!validateRequired(formData.lastName)) newErrors.lastName = 'Last name is required';
    if (!validateUsername(formData.username)) newErrors.username = 'Username must be 3-20 characters (letters, numbers, _)';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';

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
      toast.success('User created successfully!');
    } catch (error) {
      toast.error(error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} required />
      <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
      <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} required />
      <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
      <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="flex space-x-4 pt-4">
        <Button type="submit" variant="primary" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create User'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

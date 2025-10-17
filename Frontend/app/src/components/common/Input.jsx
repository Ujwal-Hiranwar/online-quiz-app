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
  className = '',
  children
}) => {
  const commonProps = {
    id: name,
    name: name,
    value: value,
    onChange: onChange,
    required: required,
    disabled: disabled,
    className: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
      error ? 'border-red-500' : 'border-gray-300'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select {...commonProps}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          {...commonProps}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;

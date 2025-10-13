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

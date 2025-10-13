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

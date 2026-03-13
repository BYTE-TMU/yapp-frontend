import React from 'react';

/**
 * LoadingSpinner - A unified, minimal loading animation component
 * Can be used across the platform for loading states
 * 
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional custom classes
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;

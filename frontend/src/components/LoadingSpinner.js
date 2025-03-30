import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="loading-icon"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;

import React from 'react';
import '../assets/bg-custom.css';

// Using CSS classes instead of inline styles to prevent JSX attribute errors
const BackgroundImage: React.FC = () => {
  return (
    <div className="background-container">
      <div className="white-grid"></div>
      <div className="diagonal-texture"></div>
      <div className="green-overlay"></div>
      <div className="scan-lines"></div>
    </div>
  );
};

export default BackgroundImage;
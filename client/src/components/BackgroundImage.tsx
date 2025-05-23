import React from 'react';

const BackgroundImage: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 -z-10 pointer-events-none dark-theme" 
      style={{
        backgroundColor: '#000000',
        backgroundImage: 'none',
      }}
    >
      {/* Actual black and white image overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' width='1' height='1'%3E%3Crect width='1' height='1' fill='%23000000'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          opacity: 1
        }}
      />
      
      {/* Black and white film grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          opacity: 0.03,
          mixBlendMode: 'lighten'
        }}
      />
      
      {/* Green tinted vignette corners */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(circle at 15% 15%, rgba(34, 197, 94, 0.2) 0%, transparent 35%),
            radial-gradient(circle at 85% 85%, rgba(34, 197, 94, 0.2) 0%, transparent 35%)
          `,
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Green Matrix-style grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          opacity: 0.2
        }}
      />
    </div>
  );
};

export default BackgroundImage;
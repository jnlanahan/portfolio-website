import React from 'react';
import bgPattern from '../assets/bg-pattern.svg';

const BackgroundImage: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Base black and white pattern from SVG */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.7
        }}
      />
      
      {/* Green tinted overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
          `,
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Matrix-style green scan line */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, transparent, rgba(34, 197, 94, 0.02) 50%, transparent 100%)
          `,
          backgroundSize: '100% 3px',
          backgroundRepeat: 'repeat',
          animation: 'scanlines 8s linear infinite',
          opacity: 0.3
        }}
      />
      
      {/* Add subtle animation for scan lines */}
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundImage;
import React from 'react';

const BackgroundImage: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 -z-10 opacity-30 pointer-events-none" 
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
          linear-gradient(140deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        mixBlendMode: 'screen'
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          opacity: 0.1,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Green tinted grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(34, 197, 94, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(34, 197, 94, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }}
      />
    </div>
  );
};

export default BackgroundImage;
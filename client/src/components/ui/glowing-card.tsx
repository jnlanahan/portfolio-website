import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  borderRadius?: string;
  className?: string;
}

export function GlowingCard({
  children,
  glowColor = 'rgba(67, 186, 147, 0.5)', // Default to our secondary color
  borderRadius = '0.75rem',
  className,
  ...props
}: GlowingCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePosition = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouch) return;

    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    updatePosition(event);
    setOpacity(1);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isHovering) {
      updatePosition(event);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setOpacity(0);
  };

  const handleTouchStart = () => {
    setIsTouch(true);
    setIsHovering(true);
    setOpacity(1);

    // For touch devices, position the glow in the center
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsHovering(false);
    setOpacity(0);
  };

  useEffect(() => {
    // Check if we're on a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        className
      )}
      style={{ borderRadius }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Glow effect */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '250px',
          height: '250px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle closest-side, ${glowColor}, transparent)`,
          opacity,
          zIndex: 1,
        }}
      />

      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
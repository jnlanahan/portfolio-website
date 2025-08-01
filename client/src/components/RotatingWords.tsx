import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingWordsProps {
  words: string[];
  interval?: number;
  className?: string;
  prefixText?: string;
}

const RotatingWords: React.FC<RotatingWordsProps> = ({ 
  words, 
  interval = 2000, 
  className = "", 
  prefixText = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % words.length;
        setKey(prev => prev + 1); // Force re-render of animation
        return newIndex;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, words.length]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      {prefixText && <span className="mr-2">{prefixText}</span>}
      <div className="relative inline-block min-w-[200px] min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={key}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute left-0 text-secondary font-bold whitespace-nowrap"
            style={{ display: 'inline-block', textShadow: '0 0 8px rgba(34, 197, 94, 0.3)' }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RotatingWords;
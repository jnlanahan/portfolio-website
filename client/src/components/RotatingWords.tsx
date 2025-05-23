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
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, words.length]);

  return (
    <div className={`inline-flex ${className}`}>
      {prefixText && <span className="mr-2">{prefixText}</span>}
      <div className="relative h-[1.5em] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute text-secondary font-medium"
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RotatingWords;
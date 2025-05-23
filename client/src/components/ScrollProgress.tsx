import { useEffect, useState } from "react";

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    
    // Call once to set initial value
    updateScrollProgress();

    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div
      className="h-[3px] bg-gradient-to-r from-primary to-secondary fixed top-0 left-0 z-50 transition-[width] duration-200"
      style={{ width: `${progress}%` }}
    ></div>
  );
};

export default ScrollProgress;

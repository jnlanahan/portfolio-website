import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that scrolls the page to the top when the location changes
 */
export function useScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to the top of the page when location changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);
}
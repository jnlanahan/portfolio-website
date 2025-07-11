import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { FaArrowLeft } from 'react-icons/fa6';

const MinimalNav = () => {
  const [location] = useLocation();
  
  // Don't show navigation on home page
  if (location === "/") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 left-4 z-50"
    >
      <Link href="/">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 px-4 py-2 hover:border-blue-400 transition-colors cursor-pointer group shadow-sm">
          <FaArrowLeft className="text-blue-600 group-hover:translate-x-[-2px] transition-transform text-sm" />
          <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Home</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default MinimalNav;
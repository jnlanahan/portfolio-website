import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

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
      className="fixed top-6 left-6 z-50"
    >
      <Link href="/">
        <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-md rounded-xl border border-secondary/20 px-4 py-2 hover:border-secondary/40 transition-colors cursor-pointer group">
          <i className="ri-arrow-left-line text-secondary group-hover:translate-x-[-2px] transition-transform"></i>
          <span className="text-sm font-medium text-foreground">Home</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default MinimalNav;
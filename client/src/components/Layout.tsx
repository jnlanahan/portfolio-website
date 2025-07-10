import React from "react";
import MinimalNav from "./MinimalNav";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import BackgroundImage from "./BackgroundImage";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Use the scroll to top hook to ensure pages start at the top
  useScrollToTop();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Custom background with green tint */}
      <BackgroundImage />
      
      <ScrollProgress />
      <MinimalNav />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

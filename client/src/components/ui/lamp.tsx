"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex h-40 w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Horizontal light beam */}
      <motion.div
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-50"
      />
      
      {/* Light glow effect */}
      <motion.div
        initial={{ width: "0%" }}
        whileInView={{ width: "80%" }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="absolute h-20 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent blur-xl z-20"
      />
      
      {/* Wider glow */}
      <motion.div
        initial={{ width: "0%" }}
        whileInView={{ width: "60%" }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="absolute h-32 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent blur-2xl z-10"
      />
      
      {children}
    </div>
  );
};
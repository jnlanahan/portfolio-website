"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  children?: React.ReactNode;
  borderWidth?: number;
  containerClassName?: string;
  disabled?: boolean;
  glow?: boolean;
  glowClassName?: string;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
}

export function GlowingEffect({
  containerClassName,
  disabled = false,
  glow = true,
  glowClassName,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 40,
  borderWidth = 2,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [inHover, setInHover] = useState<boolean>(false);
  const [gotoDirection, setGotoDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setGotoDirection({
        x: (x / rect.width) * 2 - 1,
        y: (y / rect.height) * 2 - 1,
      });

      pointerRef.current = { x, y };

      // Check if the mouse is inside the container
      const isInside =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      if (isInside) {
        setInHover(true);
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = x - centerX;
        const offsetY = y - centerY;

        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const normalizedDistance = Math.min(distance / maxDistance, 1);

        const isActive = normalizedDistance > inactiveZone;
        setOpacity(isActive ? 1 : 0);

        if (isActive) {
          setPosition({ x, y });
        }
      } else {
        setInHover(false);
        setOpacity(0);
      }
    };

    const handleMouseLeave = () => {
      setInHover(false);
      setOpacity(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, inactiveZone]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", containerClassName)}
    >
      {glow && !disabled && (
        <motion.div
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-[inherit] border-[inherit] shadow-none",
            glowClassName
          )}
          style={{
            background: `radial-gradient(${spread}rem circle at ${position.x}px ${position.y}px, 
              rgba(var(--secondary), 0.15), 
              transparent 50%)`,
            border: `${borderWidth}px solid rgba(var(--secondary), ${opacity * 0.3})`,
            opacity: inHover ? opacity : 0,
            boxShadow: `0 0 ${proximity / 5}px rgba(var(--secondary), ${
              opacity * 0.5
            })`,
            transition: inHover ? 'none' : 'opacity 0.5s',
          }}
        />
      )}
    </div>
  );
}
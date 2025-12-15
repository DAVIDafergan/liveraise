import React, { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  currency: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, currency, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  
  // Create a motion value that we'll animate
  const motionValue = useMotionValue(0);
  
  // Smooth out the motion value with a spring physics simulation
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    mass: 1
  });

  // When the target value changes, animate to it
  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  // Subscribe to updates and update the DOM directly for performance
  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return () => unsubscribe();
  }, [springValue]);

  return (
    <span className={className}>
      <span ref={ref}>0</span>
      <span className="text-4xl md:text-6xl mr-2 text-white/50 font-light align-baseline tracking-normal">
        {currency}
      </span>
    </span>
  );
};

export default AnimatedCounter;
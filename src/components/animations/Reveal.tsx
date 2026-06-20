"use client";

import React from "react";
import { motion } from "framer-motion";

type RevealVariant = "fade-up" | "slide-up" | "fade";

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  /** Duration in seconds. Kept within the 0.3–0.6s brief. */
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

const offsets: Record<RevealVariant, { y: number }> = {
  "fade-up": { y: 24 },
  "slide-up": { y: 40 },
  fade: { y: 0 },
};

/**
 * Scroll reveal using framer-motion's whileInView.
 * Re-triggers: elements fade IN as they enter the viewport and fade OUT as
 * they leave (once: false), giving a smooth fade in/out on scroll.
 * GPU-friendly (transform + opacity only) and respects reduced-motion via
 * the global CSS override.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.5,
  className,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: offsets[variant].y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2, margin: "-10% 0px -10% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

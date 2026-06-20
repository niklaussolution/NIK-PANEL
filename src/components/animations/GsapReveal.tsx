"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type RevealType = "fade-up" | "fade-left" | "fade-right" | "scale" | "blur" | "clip";

interface GsapRevealProps {
  children: React.ReactNode;
  type?: RevealType;
  delay?: number;
  duration?: number;
  stagger?: number;          // animate direct children with stagger
  className?: string;
  start?: string;
}

export default function GsapReveal({
  children,
  type = "fade-up",
  delay = 0,
  duration = 0.9,
  stagger = 0,
  className,
  start = "top 85%",
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? Array.from(el.children) : [el];

    const fromVars: gsap.TweenVars = { opacity: 0 };
    switch (type) {
      case "fade-up":    fromVars.y = 40; break;
      case "fade-left":  fromVars.x = -50; break;
      case "fade-right": fromVars.x = 50; break;
      case "scale":      fromVars.scale = 0.92; break;
      case "blur":       fromVars.filter = "blur(10px)"; fromVars.y = 20; break;
      case "clip":       fromVars.clipPath = "inset(0 0 100% 0)"; fromVars.y = 20; break;
    }

    gsap.set(targets, fromVars);

    gsap.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      clipPath: "inset(0 0 0% 0)",
      duration,
      delay,
      stagger: stagger || 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Terminal } from "lucide-react";
import Button from "@/components/ui/Button";
import { assets } from "@/lib/assets";

const WORDS = [
  "Developers",
  "Startups",
  "SaaS Platforms",
  "AI Applications",
  "Enterprise Teams",
  "Production Systems",
];

// Human-like typing: slight speed variation per character
function randomDelay(base: number, spread: number) {
  return base + (Math.random() - 0.5) * spread;
}

function useTypewriter(words: string[]) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(() => {
    const word = words[wordIndex];

    if (phase === "typing") {
      if (displayed.length < word.length) {
        const next = word.slice(0, displayed.length + 1);
        setDisplayed(next);
        timeoutRef.current = setTimeout(tick, randomDelay(90, 60));
      } else {
        setPhase("pause");
        timeoutRef.current = setTimeout(tick, 1600);
      }
    } else if (phase === "pause") {
      setPhase("erasing");
      timeoutRef.current = setTimeout(tick, 0);
    } else {
      // erasing
      if (displayed.length > 0) {
        setDisplayed((d) => d.slice(0, -1));
        timeoutRef.current = setTimeout(tick, randomDelay(55, 30));
      } else {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase("typing");
        timeoutRef.current = setTimeout(tick, 300);
      }
    }
  }, [displayed, phase, wordIndex, words]);

  useEffect(() => {
    timeoutRef.current = setTimeout(tick, 120);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tick]);

  return displayed;
}

const trust = [
  { icon: Zap, label: "Deployed in 60s" },
  { icon: ShieldCheck, label: "Free DDoS protection" },
  { icon: Terminal, label: "Full root access" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -70]);

  const typedWord = useTypewriter(WORDS);

  return (
    <section ref={ref} className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
      {/* dotted grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0f172a12 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 100% 75% at 50% 0%, #000 45%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 75% at 50% 0%, #000 45%, transparent 100%)",
        }}
      />
      {/* color glows */}
      <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] bg-orange-100/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-32 -right-20 w-[32rem] h-[32rem] bg-blue-100/40 rounded-full blur-[150px] pointer-events-none" />
      {/* decorative shapes */}
      <div className="hidden lg:block absolute top-24 right-[6%] w-56 h-36 rounded-2xl border border-gray-200/70 rotate-6 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-24 left-[4%] w-40 h-28 rounded-2xl border border-gray-200/60 -rotate-6 pointer-events-none" />
      <div className="hidden lg:block absolute top-1/2 left-[44%] w-24 h-24 rounded-full border border-dashed border-orange-200/70 pointer-events-none" />
      {/* faint connection dots */}
      <svg className="hidden lg:block absolute top-40 left-[40%] w-40 h-24 pointer-events-none opacity-60" viewBox="0 0 160 96" fill="none">
        <line x1="10" y1="20" x2="80" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 5" />
        <line x1="80" y1="60" x2="150" y2="16" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 5" />
        <circle cx="10" cy="20" r="4" fill="#FF6B00" />
        <circle cx="80" cy="60" r="4" fill="#0066FF" />
        <circle cx="150" cy="16" r="4" fill="#FF6B00" />
      </svg>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-xs font-semibold text-[#FF6B00]">
              <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse" />
              KVM VPS · NVMe · 12 global regions
            </span>

            {/* Typewriter headline — fixed height prevents layout shift */}
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-[3.3rem] font-bold text-gray-900 leading-[1.1] tracking-tight">
              Deploy High-Performance
              <br />
              <span className="text-[#0066FF]">VPS</span>{" "}
              <span className="text-gray-900">for</span>
              <br />
              {/* Container: fixed min-height so text reflow doesn't shift elements below */}
              <span
                className="inline-block min-h-[1.2em] align-bottom"
                aria-live="polite"
                aria-label={`for ${WORDS[0]} and more`}
              >
                <span className="text-[#FF6B00]">{typedWord}</span>
                {/* blinking cursor */}
                <span
                  className="inline-block w-[3px] ml-0.5 align-text-bottom rounded-sm"
                  style={{
                    height: "0.9em",
                    backgroundColor: "#FF6B00",
                    animation: "blink-caret 0.9s step-start infinite",
                  }}
                />
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl">
              NIKPanel gives developers and businesses dedicated KVM virtual
              servers with full root access, NVMe SSD speed and a 99.9% uptime
              SLA — all managed from one clean, powerful dashboard.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-md shadow-orange-500/20">
                  Deploy Your VPS
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {trust.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <t.icon className="w-4 h-4 text-[#0066FF]" />
                  {t.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — VPS control-panel mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <Image
              src={assets.screenshots.vpsHero}
              alt="NIKPanel VPS control panel with live CPU, memory and uptime monitoring"
              width={640}
              height={540}
              priority
              className="w-full h-auto select-none drop-shadow-xl"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Cursor blink keyframe — injected inline to avoid globals.css edits */}
      <style>{`
        @keyframes blink-caret {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </section>
  );
}

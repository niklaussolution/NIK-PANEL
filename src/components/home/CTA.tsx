"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/animations/Reveal";

const points = ["No setup fees", "Cancel anytime", "30-day money-back guarantee"];

export default function CTA() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#0B1220] px-8 py-16 lg:px-16 lg:py-20 text-center">
            {/* subtle grid + accent glow */}
            <div
              className="absolute inset-0 opacity-[0.18] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#ffffff14 1px, transparent 1px), linear-gradient(90deg, #ffffff14 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-[#FF6B00]/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-orange-200">
                <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full" />
                Start in minutes
              </span>

              <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready to launch your project on NIKPanel?
              </h2>
              <p className="mt-4 text-base lg:text-lg text-gray-400 max-w-xl mx-auto">
                Join 500+ businesses running faster, safer infrastructure on
                a platform built for performance and reliability.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-orange-900/30">
                    Get Started Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto !text-white border border-white/15 hover:bg-white/5"
                  >
                    Talk to Sales
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-[#FF6B00]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

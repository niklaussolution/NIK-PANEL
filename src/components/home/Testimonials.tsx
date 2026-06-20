"use client";

import React from "react";
import { Star } from "lucide-react";
import Reveal from "@/components/animations/Reveal";

const testimonials = [
  {
    quote:
      "We migrated from a major provider and cut our page load times in half. The dashboard is genuinely the easiest I've used.",
    name: "Priya Sharma",
    role: "Founder, Bloom Studio",
    initials: "PS",
    color: "bg-orange-500",
  },
  {
    quote:
      "Uptime has been flawless for over a year. Whenever I open a ticket, support replies within minutes — real engineers, not scripts.",
    name: "Arjun Mehta",
    role: "CTO, FinEdge",
    initials: "AM",
    color: "bg-blue-600",
  },
  {
    quote:
      "Instant deployment changed how fast we ship. Spinning up staging environments now takes seconds instead of an afternoon.",
    name: "Sara Khan",
    role: "Lead Developer, Pixelware",
    initials: "SK",
    color: "bg-green-600",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
            Customer Stories
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Loved by 50,000+ businesses
          </h2>
          <p className="mt-3 text-gray-500">
            Rated 4.9/5 across thousands of verified reviews.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.08}
              className="flex flex-col p-7 bg-white rounded-2xl border border-gray-100 hover:shadow-card transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} text-white flex items-center justify-center text-sm font-semibold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

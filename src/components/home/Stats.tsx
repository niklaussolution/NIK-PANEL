"use client";

import React from "react";
import GsapReveal from "@/components/animations/GsapReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";

const stats = [
  { value: 99.9, decimals: 1, suffix: "%",     label: "Uptime SLA" },
  { value: 2,    decimals: 0, prefix: "< ", suffix: "ms", label: "Network Latency" },
  { value: 10,   decimals: 0, suffix: " Gbps", label: "Network Speed" },
  { value: 24,   decimals: 0, suffix: "/7",    label: "Expert Support" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GsapReveal type="fade-up" stagger={0.12} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-gray-900">
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-1.5 text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

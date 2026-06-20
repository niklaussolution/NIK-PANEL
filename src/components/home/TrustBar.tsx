"use client";

import React from "react";
import { Users, ShieldCheck, Globe2, Headphones } from "lucide-react";
import Reveal from "@/components/animations/Reveal";

const stats = [
  { icon: Users, value: "50,000+", label: "Active customers" },
  { icon: ShieldCheck, value: "99.9%", label: "Uptime guarantee" },
  { icon: Globe2, value: "12", label: "Global server locations" },
  { icon: Headphones, value: "24/7", label: "Expert support" },
];

const badges = ["PCI DSS", "ISO 27001", "GDPR Ready", "SSL Secured", "DDoS Protected"];

export default function TrustBar() {
  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-card transition-shadow duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Trusted &amp; certified
          </span>
          {badges.map((b) => (
            <span
              key={b}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {b}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

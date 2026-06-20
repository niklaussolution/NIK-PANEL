"use client";

import React from "react";
import { HardDrive, Shield, Database, Rocket, Headphones, Globe2 } from "lucide-react";
import Reveal from "@/components/animations/Reveal";

const features = [
  {
    icon: HardDrive,
    title: "NVMe SSD Storage",
    desc: "Ultra-fast NVMe drives deliver up to 20× faster read/write speeds than standard SSDs.",
    color: "text-[#FF6B00]",
    bg: "bg-orange-50",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    desc: "Always-on, enterprise-grade mitigation keeps your sites online during attacks.",
    color: "text-[#0066FF]",
    bg: "bg-blue-50",
  },
  {
    icon: Database,
    title: "Daily Backups",
    desc: "Automated backups with one-click restore so your data is always safe and recoverable.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Rocket,
    title: "Instant Deployment",
    desc: "Spin up a fully configured server in under 60 seconds — no waiting, no setup hassle.",
    color: "text-[#FF6B00]",
    bg: "bg-orange-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Real hosting experts available around the clock via live chat, ticket and phone.",
    color: "text-[#0066FF]",
    bg: "bg-blue-50",
  },
  {
    icon: Globe2,
    title: "Global Network",
    desc: "12 data center locations and a global CDN keep your content fast everywhere.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function Features() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
            Why NIKPanel
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Everything you need to launch &amp; scale
          </h2>
          <p className="mt-3 text-gray-500">
            Built-in performance, security and reliability — no add-ons required.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 0.08}
              className="group p-7 bg-white rounded-2xl border border-gray-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

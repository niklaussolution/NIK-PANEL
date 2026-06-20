"use client";

import React from "react";
import { motion } from "framer-motion";

// Professional tech stack visual with animated pipeline
const STACK_ITEMS = [
  {
    name: "AlmaLinux 9",
    desc: "Enterprise Linux",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="20" r="18" fill="#0d2137" />
        <path d="M20 6 L32 26 H8 Z" fill="#00b4ff" opacity="0.9" />
        <path d="M20 10 L29 26 H11 Z" fill="#003d66" />
        <circle cx="20" cy="20" r="4" fill="#00b4ff" />
      </svg>
    ),
    color: "border-blue-100 bg-blue-50",
  },
  {
    name: "CyberPanel",
    desc: "Web Control Panel",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect width="40" height="40" rx="8" fill="#1a3a5c" />
        <rect x="6" y="10" width="28" height="20" rx="3" fill="#0e5f9f" />
        <rect x="9" y="13" width="22" height="3" rx="1" fill="#4fc3f7" />
        <rect x="9" y="19" width="14" height="2" rx="1" fill="#4fc3f7" opacity="0.5" />
        <rect x="9" y="23" width="9" height="2" rx="1" fill="#4fc3f7" opacity="0.3" />
        <circle cx="29" cy="24" r="4" fill="#22c55e" />
        <path d="M27 24 L28.5 25.5 L31.5 22.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    color: "border-cyan-100 bg-cyan-50",
  },
  {
    name: "Docker",
    desc: "Container Engine",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect width="40" height="40" rx="8" fill="#1d63ed" opacity="0.15" />
        <path d="M6 22 C6 22 4 20 6 18 C8 16 10 17 11 16 C12 15 11 13 13 12 C15 11 17 13 18 12 C19 11 18 9 20 8 C22 7 23 9 24 10" stroke="#1d63ed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Container boxes */}
        {[0,1,2].map(i => (
          <rect key={i} x={10 + i*9} y={18} width={7} height={6} rx={1} fill="#1d63ed" opacity={0.8 - i*0.15} />
        ))}
        {[0,1].map(i => (
          <rect key={i} x={14 + i*9} y={12} width={7} height={6} rx={1} fill="#1d63ed" opacity={0.65 - i*0.1} />
        ))}
        <rect x={23} y={6} width={7} height={6} rx={1} fill="#1d63ed" opacity={0.5} />
        {/* Whale body */}
        <path d="M6 26 Q20 30 34 24" stroke="#1d63ed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="24" rx="3" ry="2" fill="#1d63ed" opacity="0.6" />
      </svg>
    ),
    color: "border-indigo-100 bg-indigo-50",
  },
  {
    name: "KVM",
    desc: "Hypervisor",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect width="40" height="40" rx="8" fill="#FF6B00" opacity="0.1" />
        <rect x="7" y="8" width="26" height="18" rx="3" fill="#FF6B00" opacity="0.2" stroke="#FF6B00" strokeWidth="1.2" />
        <rect x="11" y="12" width="8" height="10" rx="2" fill="#FF6B00" opacity="0.6" />
        <rect x="21" y="12" width="8" height="10" rx="2" fill="#FF6B00" opacity="0.4" />
        <rect x="13" y="28" width="14" height="3" rx="1.5" fill="#FF6B00" opacity="0.4" />
        <rect x="18" y="26" width="4" height="4" rx="0.5" fill="#FF6B00" opacity="0.6" />
      </svg>
    ),
    color: "border-orange-100 bg-orange-50",
  },
];

const PIPELINE_STEPS = [
  { step: "01", label: "Order VPS",     desc: "Pick a plan, complete checkout" },
  { step: "02", label: "Auto Provision", desc: "OS + CyberPanel + Docker deployed" },
  { step: "03", label: "Get Credentials", desc: "IP, root access, panel URL" },
  { step: "04", label: "Deploy & Scale", desc: "Your apps live in minutes" },
];

export default function TechStack() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">
            Default Stack
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Everything pre-configured on every VPS
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            No manual setup. No choosing OS. Every VPS ships with this production-ready stack in under 5 minutes.
          </p>
        </motion.div>

        {/* Tech stack cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {STACK_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className={`bg-white rounded-[16px] border ${item.color} p-6 flex flex-col items-center text-center shadow-card hover:shadow-card-hover transition-shadow`}
            >
              <div className={`w-16 h-16 rounded-[14px] border ${item.color} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <p className="text-sm font-bold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Provisioning pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8"
        >
          <h3 className="text-base font-semibold text-gray-900 text-center mb-10">
            From order to live VPS in under 5 minutes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
            {PIPELINE_STEPS.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-px">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-orange-200"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                    {/* Arrow dot */}
                    <motion.div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + i * 0.15 }}
                    />
                  </div>
                )}

                {/* Step circle */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.15 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-4 flex-shrink-0 ${
                    i === 0
                      ? "bg-[#FF6B00] text-white"
                      : "bg-orange-50 text-[#FF6B00] border-2 border-orange-200"
                  }`}
                >
                  {s.step}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
                >
                  <p className="text-sm font-semibold text-gray-900 mb-1">{s.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-[130px] mx-auto">{s.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

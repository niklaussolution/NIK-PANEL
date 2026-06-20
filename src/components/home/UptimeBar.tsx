"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Activity, Clock, Cpu, Zap, TrendingUp, Server as ServerIcon,
} from "lucide-react";

// 90-day uptime blocks — mostly perfect, a couple tiny dips
const days = Array.from({ length: 90 }, (_, i) =>
  i === 14 || i === 51 ? 0.97 : i === 30 ? 0.999 : 1
);

// Live latency graph points (subtle wave)
const latencyPoints = [
  18, 16, 19, 14, 17, 13, 15, 12, 16, 11, 14, 10, 13, 12, 15, 11, 13, 9, 12, 10,
  14, 11, 13, 10, 12, 9, 11, 13, 10, 12,
];

function buildAreaPath(points: number[], w: number, h: number) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const stepX = w / (points.length - 1);
  const norm = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 12) - 6;
  let d = `M 0 ${norm(points[0])}`;
  points.forEach((p, i) => {
    if (i === 0) return;
    const x = i * stepX;
    const px = (i - 1) * stepX;
    const cx = (px + x) / 2;
    d += ` Q ${cx} ${norm(points[i - 1])} ${x} ${norm(p)}`;
  });
  return { line: d, area: `${d} L ${w} ${h} L 0 ${h} Z` };
}

export default function UptimeBar() {
  const { line, area } = buildAreaPath(latencyPoints, 320, 90);

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
            Reliability
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Enterprise-grade uptime, monitored 24/7
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Real-time infrastructure monitoring keeps your VPS online with a 99.9% uptime guarantee.
          </p>
        </motion.div>

        {/* Top row: Server illustration + Live monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* LEFT — Server rack illustration card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-[12px] flex items-center justify-center">
                <ServerIcon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Tier-III Datacenters</h3>
                <p className="text-xs text-gray-400">Redundant power & cooling</p>
              </div>
            </div>

            {/* Server rack SVG illustration */}
            <div className="flex-1 flex items-center justify-center">
              <svg viewBox="0 0 260 220" className="w-full max-w-[260px] h-auto">
                <defs>
                  <linearGradient id="rack-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f2937" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>
                  <linearGradient id="rack-unit" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#283344" />
                  </linearGradient>
                </defs>

                {/* Rack frame */}
                <rect x="40" y="14" width="180" height="192" rx="10" fill="url(#rack-body)" />
                <rect x="40" y="14" width="180" height="192" rx="10" fill="none" stroke="#374151" strokeWidth="1.5" />

                {/* 7 server units */}
                {Array.from({ length: 7 }).map((_, i) => {
                  const y = 26 + i * 25;
                  return (
                    <g key={i}>
                      <rect x="52" y={y} width="156" height="19" rx="3" fill="url(#rack-unit)" stroke="#4b5563" strokeWidth="0.5" />
                      {/* Drive slots */}
                      {Array.from({ length: 5 }).map((_, j) => (
                        <rect key={j} x={60 + j * 9} y={y + 5} width="5" height="9" rx="1" fill="#1f2937" />
                      ))}
                      {/* Status LEDs — animated */}
                      <motion.circle
                        cx="178" cy={y + 6} r="2"
                        fill="#22c55e"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                      />
                      <motion.circle
                        cx="178" cy={y + 13} r="2"
                        fill={i % 3 === 0 ? "#FF6B00" : "#3b82f6"}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                      />
                      <rect x="188" y={y + 4} width="12" height="11" rx="1.5" fill="#0f172a" />
                    </g>
                  );
                })}

                {/* Floor shadow */}
                <ellipse cx="130" cy="212" rx="92" ry="6" fill="#000" opacity="0.06" />
              </svg>
            </div>

            {/* Bottom feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {["N+1 Power", "DDoS Shield", "24/7 NOC"].map((tag) => (
                <span key={tag} className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Live latency monitor */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#0066FF]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Network Latency</h3>
                  <p className="text-xs text-gray-400">Last 30 minutes · Live</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Healthy
              </span>
            </div>

            {/* Latency graph */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">10</span>
                <span className="text-sm text-gray-400 mb-1.5">ms avg</span>
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium mb-2 ml-2">
                  <TrendingUp className="w-3 h-3 rotate-180" /> 12% lower
                </span>
              </div>

              <svg viewBox="0 0 320 90" className="w-full h-auto">
                <defs>
                  <linearGradient id="lat-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 30, 60, 90].map((y) => (
                  <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {/* Area fill */}
                <motion.path
                  d={area}
                  fill="url(#lat-area)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                {/* Line */}
                <motion.path
                  d={line}
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
                {/* Live pulse dot at end */}
                <motion.circle
                  cx="320" cy="36" r="3.5"
                  fill="#0066FF"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </svg>

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>30m ago</span>
                <span>20m</span>
                <span>10m</span>
                <span>now</span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-50">
              {[
                { label: "Peak", value: "19ms" },
                { label: "Avg", value: "12ms" },
                { label: "Min", value: "9ms" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Uptime status page card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="bg-white rounded-[20px] border border-gray-100 shadow-card overflow-hidden mb-6"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-green-800">All systems operational</p>
            </div>
            <span className="text-xs text-green-600 font-medium">99.98% · 90 days</span>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              { label: "VPS Infrastructure", uptime: "99.98%" },
              { label: "Network / DDoS Protection", uptime: "100%" },
              { label: "CyberPanel API", uptime: "99.95%" },
              { label: "Customer Dashboard", uptime: "99.99%" },
            ].map((service) => (
              <div key={service.label} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-800">{service.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{service.uptime}</span>
                </div>
                <div className="flex items-end gap-[3px]">
                  {days.map((val, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        val >= 1 ? "bg-green-400" : val >= 0.99 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ height: "16px" }}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.004 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stat cards with icons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: Activity,    value: "99.99%",  label: "Uptime last 12 months", bg: "bg-green-50",  color: "text-green-600" },
            { icon: Clock,       value: "< 2 min", label: "Mean time to resolve",  bg: "bg-blue-50",   color: "text-[#0066FF]" },
            { icon: ShieldCheck, value: "24 / 7",  label: "Infrastructure monitoring", bg: "bg-orange-50", color: "text-[#FF6B00]" },
            { icon: Zap,         value: "10 Gbps", label: "Network capacity",      bg: "bg-purple-50", color: "text-purple-600" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="bg-white border border-gray-100 rounded-[16px] shadow-card p-5"
            >
              <div className={`w-11 h-11 ${item.bg} rounded-[12px] flex items-center justify-center mb-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

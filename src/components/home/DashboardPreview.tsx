"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  Building2,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Terminal,
  Activity,
} from "lucide-react";
import Reveal from "@/components/animations/Reveal";

const GEO_URL = "/world-110m.json";

type Loc = { id: string; label: string; flag: string; coordinates: [number, number]; w: number };

const LOCATIONS: Loc[] = [
  { id: "la", label: "Los Angeles", flag: "🇺🇸", coordinates: [-118.24, 34.05], w: 112 },
  { id: "ny", label: "New York", flag: "🇺🇸", coordinates: [-74.0, 40.71], w: 92 },
  { id: "fra", label: "Frankfurt", flag: "🇩🇪", coordinates: [8.68, 50.11], w: 92 },
  { id: "mum", label: "Mumbai", flag: "🇮🇳", coordinates: [72.87, 19.07], w: 84 },
  { id: "sin", label: "Singapore", flag: "🇸🇬", coordinates: [103.8, 1.35], w: 92 },
];

const ARCS: [string, string][] = [
  ["la", "ny"],
  ["ny", "fra"],
  ["fra", "mum"],
  ["mum", "sin"],
];

const getLoc = (id: string) => LOCATIONS.find((l) => l.id === id)!;

const stats = [
  { icon: Globe2, value: "12", label: "Global locations" },
  { icon: Building2, value: "Tier III", label: "Certified facilities" },
  { icon: Zap, value: "10 Gbps", label: "Network uplink" },
  { icon: ShieldCheck, value: "99.9%", label: "Uptime SLA" },
];

const terminalLines = [
  { text: "$ nik deploy --prod", color: "#94A3B8" },
  { text: "› Building image", color: "#E2E8F0" },
  { text: "› Pushing to edge", color: "#FF8A3D" },
  { text: "› Provisioning VPS", color: "#E2E8F0" },
  { text: "✓ Live in 11.2s", color: "#46D17F" },
];

const bars = [
  { h: 70, c: "#FF6B00" },
  { h: 88, c: "#0066FF" },
  { h: 64, c: "#FF6B00" },
  { h: 96, c: "#0066FF" },
  { h: 74, c: "#FF6B00" },
  { h: 58, c: "#0066FF" },
  { h: 80, c: "#FF6B00" },
];

const highlights = [
  {
    icon: LayoutDashboard,
    title: "One simple control panel",
    desc: "Manage servers, domains, SSL and backups from a single intuitive dashboard.",
  },
  {
    icon: Terminal,
    title: "Deploy in one click",
    desc: "Launch WordPress, Docker or Node apps instantly — no command line required.",
  },
  {
    icon: Activity,
    title: "Live resource metrics",
    desc: "Real-time CPU, RAM and bandwidth monitoring so you always stay in control.",
  },
];

export default function DashboardPreview() {
  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
            Our Infrastructure
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Enterprise-grade infrastructure, built for{" "}
            <span className="text-[#FF6B00]">uptime</span>
          </h2>
          <p className="mt-3 text-gray-500">
            Your VPS runs on redundant, Tier-III facilities with NVMe storage and
            a 10 Gbps network — managed for you, 24/7.
          </p>
        </Reveal>

        {/* Map card */}
        <Reveal delay={0.1} className="mt-12">
  <div className="rounded-3xl border border-gray-200 bg-white shadow-card-hover overflow-hidden">
    <div className="relative">

      <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm text-xs font-medium text-gray-700">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        All systems operational
      </div>

      <div className="h-[460px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Globe2 className="w-16 h-16 mx-auto text-[#FF6B00] mb-4" />

          <h3 className="text-2xl font-bold text-gray-900">
            Global Infrastructure Network
          </h3>

          <p className="text-gray-500 mt-2">
            Enterprise-grade VPS infrastructure across multiple regions.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-4 py-2 bg-white rounded-full border">🇺🇸 Los Angeles</span>
            <span className="px-4 py-2 bg-white rounded-full border">🇺🇸 New York</span>
            <span className="px-4 py-2 bg-white rounded-full border">🇩🇪 Frankfurt</span>
            <span className="px-4 py-2 bg-white rounded-full border">🇮🇳 Mumbai</span>
            <span className="px-4 py-2 bg-white rounded-full border">🇸🇬 Singapore</span>
          </div>
        </div>
      </div>

    </div>

    {/* stats strip */}
            {/* stats strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-gray-100 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3.5 px-6 py-6"
                >
                  <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Terminal + Metrics + Highlights */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <Reveal className="rounded-2xl bg-[#0B1220] p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-[#E2554B]" />
              <span className="w-3 h-3 rounded-full bg-[#E8A93C]" />
              <span className="w-3 h-3 rounded-full bg-[#46B27A]" />
            </div>
            <div className="font-mono text-[13px] space-y-2">
              {terminalLines.map((l, i) => (
                <motion.p
                  key={l.text}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.25 }}
                  style={{ color: l.color }}
                >
                  {l.text}
                </motion.p>
              ))}
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, delay: 0.4, ease: "easeInOut" }}
                className="h-full bg-[#FF6B00] rounded-full"
              />
            </div>
          </Reveal>

          {/* Live metrics */}
          <Reveal delay={0.08} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Live Server Metrics</p>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col justify-between text-[10px] text-gray-400 py-1 h-40">
                <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
              </div>
              <div className="relative flex-1 h-40 flex items-end justify-between gap-2 border-l border-b border-gray-100 pl-2 pb-px">
                {bars.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${b.h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 rounded-t-md"
                    style={{ backgroundColor: b.c }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B00]" />CPU Usage</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0066FF]" />RAM Usage</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300" />Network</span>
            </div>
          </Reveal>

          {/* Highlights */}
          <Reveal delay={0.16} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card flex flex-col justify-center gap-5">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <h.icon className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{h.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

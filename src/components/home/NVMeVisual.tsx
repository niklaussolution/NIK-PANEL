"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, HardDrive, ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const SPECS = [
  { label: "Sequential Read",  value: "7,000 MB/s",  pct: 95 },
  { label: "Sequential Write", value: "6,500 MB/s",  pct: 88 },
  { label: "Random IOPS",      value: "1,000,000",   pct: 100 },
  { label: "Latency",          value: "< 0.1ms",     pct: 72 },
];

const CHIPS = Array.from({ length: 20 });

export default function NVMeVisual() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">
              NVMe SSD Storage
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Up to 10× faster than regular SSDs
            </h2>
            <p className="mt-5 text-gray-500 leading-relaxed">
              Every NIKPanel VPS runs on enterprise-grade NVMe SSDs. Your databases, applications, and files load instantly — no I/O bottlenecks, no shared disk contention.
            </p>

            {/* Spec bars */}
            <div className="mt-8 space-y-4">
              {SPECS.map((spec, i) => (
                <div key={spec.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{spec.label}</span>
                    <span className="text-sm font-bold text-gray-900">{spec.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9A00]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${spec.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/plans">
                <Button size="md" className="gap-2">
                  View Plans <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right — NVMe SSD SVG illustration */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              <svg viewBox="0 0 380 280" className="w-full h-auto drop-shadow-lg">
                <defs>
                  <linearGradient id="pcb-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e2d3d" />
                    <stop offset="100%" stopColor="#162230" />
                  </linearGradient>
                  <linearGradient id="chip-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2d4a6e" />
                    <stop offset="100%" stopColor="#1a3050" />
                  </linearGradient>
                  <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a847" />
                    <stop offset="100%" stopColor="#b8922e" />
                  </linearGradient>
                  <linearGradient id="led-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="shadow-sm">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* PCB Board */}
                <rect x="20" y="40" width="340" height="200" rx="10" fill="url(#pcb-grad)" filter="url(#shadow-sm)" />

                {/* PCB edge detail lines */}
                <rect x="20" y="40" width="340" height="200" rx="10" fill="none" stroke="#243447" strokeWidth="1" />
                <line x1="20" y1="56" x2="360" y2="56" stroke="#243447" strokeWidth="0.5" strokeOpacity="0.6" />

                {/* M.2 slot connector at right */}
                <rect x="326" y="120" width="34" height="60" rx="2" fill="url(#gold-grad)" />
                {Array.from({ length: 14 }).map((_, i) => (
                  <rect key={i} x={328} y={124 + i * 4} width={30} height={2.5} rx={0.5}
                    fill={i % 2 === 0 ? "#c9963a" : "#b8922e"} />
                ))}

                {/* Main controller chip */}
                <rect x="44" y="68" width="90" height="70" rx="4" fill="url(#chip-grad)" />
                <rect x="44" y="68" width="90" height="70" rx="4" fill="none" stroke="#3a5f85" strokeWidth="0.8" />
                <text x="89" y="99" textAnchor="middle" fontSize="7" fill="#60a5cc" fontFamily="monospace" fontWeight="600">NVME</text>
                <text x="89" y="109" textAnchor="middle" fontSize="7" fill="#60a5cc" fontFamily="monospace" fontWeight="600">CTRL</text>
                <text x="89" y="119" textAnchor="middle" fontSize="6" fill="#3a7aa0" fontFamily="monospace">Gen 4 × 4</text>
                {/* Chip pins */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i}>
                    <rect x={48 + i * 11} y={136} width={4} height={6} rx={1} fill="#d4a847" />
                    <rect x={48 + i * 11} y={62} width={4} height={6} rx={1} fill="#d4a847" />
                  </g>
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <g key={i}>
                    <rect x={40} y={72 + i * 14} width={4} height={5} rx={1} fill="#d4a847" />
                    <rect x={130} y={72 + i * 14} width={4} height={5} rx={1} fill="#d4a847" />
                  </g>
                ))}

                {/* NAND Flash chips grid */}
                {CHIPS.map((_, i) => {
                  const col = i % 4;
                  const row = Math.floor(i / 4);
                  const x = 154 + col * 38;
                  const y = 62 + row * 38;
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={30} height={28} rx={2} fill="url(#chip-grad)" />
                      <rect x={x} y={y} width={30} height={28} rx={2} fill="none" stroke="#3a5f85" strokeWidth="0.6" />
                      <text x={x + 15} y={y + 11} textAnchor="middle" fontSize="4.5" fill="#4a8ab0" fontFamily="monospace">NAND</text>
                      <text x={x + 15} y={y + 19} textAnchor="middle" fontSize="4" fill="#3a7aa0" fontFamily="monospace">512GB</text>
                      {/* Chip top pins */}
                      {[3, 9, 15, 21, 27].map((px) => (
                        <rect key={px} x={x + px - 1} y={y - 3} width={2.5} height={3} rx={0.5} fill="#d4a847" />
                      ))}
                    </g>
                  );
                })}

                {/* PCB trace lines */}
                <path d="M 134 103 L 152 103" stroke="#4a8ab0" strokeWidth="0.8" strokeOpacity="0.5" />
                <path d="M 134 115 L 152 115" stroke="#4a8ab0" strokeWidth="0.8" strokeOpacity="0.5" />
                <path d="M 134 90 L 152 90 L 152 62" stroke="#4a8ab0" strokeWidth="0.8" strokeOpacity="0.5" />
                <path d="M 318 140 L 326 140" stroke="#d4a847" strokeWidth="0.8" strokeOpacity="0.6" />
                <path d="M 318 160 L 326 160" stroke="#d4a847" strokeWidth="0.8" strokeOpacity="0.6" />

                {/* LED indicator */}
                <motion.rect
                  x="36" y="54" width="6" height="6" rx="1"
                  fill="url(#led-glow)"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <text x="46" y="60" fontSize="5" fill="#4a8ab0" fontFamily="monospace">PWR</text>

                {/* Activity LED */}
                <motion.rect
                  x="36" y="64" width="6" height="6" rx="1"
                  fill="#22c55e"
                  animate={{ opacity: [1, 0.1, 0.8, 0.2, 1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <text x="46" y="70" fontSize="5" fill="#4a8ab0" fontFamily="monospace">ACT</text>

                {/* Label sticker */}
                <rect x="44" y="165" width="90" height="56" rx="3" fill="#f0f0e8" />
                <rect x="44" y="165" width="90" height="56" rx="3" fill="none" stroke="#d4d4cc" strokeWidth="0.5" />
                <text x="89" y="182" textAnchor="middle" fontSize="7.5" fill="#333" fontFamily="Arial, sans-serif" fontWeight="700">NIKPanel</text>
                <text x="89" y="193" textAnchor="middle" fontSize="6" fill="#666" fontFamily="Arial, sans-serif">NVMe Gen 4 SSD</text>
                <text x="89" y="204" textAnchor="middle" fontSize="6" fill="#666" fontFamily="monospace">7000 MB/s Read</text>
                <text x="89" y="214" textAnchor="middle" fontSize="5.5" fill="#999" fontFamily="monospace">AlmaLinux 9 Optimized</text>

                {/* Animated data flow particles on PCB traces */}
                {[103, 115, 90].map((y, i) => (
                  <motion.circle
                    key={y}
                    r="1.5"
                    fill="#FF6B00"
                    fillOpacity="0.8"
                    initial={{ x: 134 }}
                    animate={{ x: [134, 152] }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.25,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "linear",
                    }}
                    style={{ cy: y }}
                  />
                ))}
              </svg>

              {/* Speed badges floating */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -top-3 -right-2 bg-white border border-gray-100 rounded-[12px] shadow-card px-3 py-2 flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-orange-50 rounded-[6px] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">7,000 MB/s</p>
                  <p className="text-[10px] text-gray-400">Read Speed</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65 }}
                className="absolute -bottom-3 -left-2 bg-white border border-gray-100 rounded-[12px] shadow-card px-3 py-2 flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-blue-50 rounded-[6px] flex items-center justify-center">
                  <HardDrive className="w-3.5 h-3.5 text-[#0066FF]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Gen 4 NVMe</p>
                  <p className="text-[10px] text-gray-400">Enterprise SSD</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

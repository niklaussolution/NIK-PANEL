"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { VPSPlan } from "@/types";
import Button from "@/components/ui/Button";

interface PlanCardProps {
  plan: VPSPlan;
  index: number;
}

const INCLUDED = [
  "AlmaLinux 9 Pre-installed",
  "CyberPanel Control Panel",
  "Docker Pre-configured",
  "Full Root Access",
  "KVM Virtualization",
  "DDoS Protection",
  "99.9% Uptime SLA",
  "24/7 Support",
];

export default function PlanCard({ plan, index }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className={`relative rounded-[20px] border p-7 flex flex-col transition-shadow duration-300 ${
        plan.popular
          ? "bg-[#FF6B00] border-[#FF6B00] shadow-xl text-white"
          : "bg-white border-gray-150 shadow-card hover:shadow-card-hover"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            <Zap className="w-3 h-3 text-[#FF6B00]" />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-3 ${plan.popular ? "text-white" : "text-gray-900"}`}>
          {plan.name}
        </h3>
        <div className="flex items-end gap-1">
          <span className={`text-4xl font-extrabold ${plan.popular ? "text-white" : "text-gray-900"}`}>
            ₹{plan.price}
          </span>
          <span className={`text-sm mb-1.5 ${plan.popular ? "text-orange-100" : "text-gray-400"}`}>
            /month
          </span>
        </div>
      </div>

      {/* Specs */}
      <div className={`rounded-[12px] p-4 mb-6 space-y-2.5 ${plan.popular ? "bg-white/15" : "bg-gray-50"}`}>
        {[
          { label: "CPU",       value: plan.cpu },
          { label: "RAM",       value: plan.ram },
          { label: "Storage",   value: plan.storage },
          { label: "Bandwidth", value: plan.bandwidth },
        ].map((spec) => (
          <div key={spec.label} className="flex items-center justify-between">
            <span className={`text-sm ${plan.popular ? "text-orange-100" : "text-gray-500"}`}>{spec.label}</span>
            <span className={`text-sm font-semibold ${plan.popular ? "text-white" : "text-gray-900"}`}>{spec.value}</span>
          </div>
        ))}
      </div>

      <ul className="space-y-2.5 flex-1 mb-7">
        {INCLUDED.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? "bg-white/25" : "bg-orange-50"}`}>
              <Check className={`w-2.5 h-2.5 ${plan.popular ? "text-white" : "text-[#FF6B00]"}`} />
            </div>
            <span className={`text-sm ${plan.popular ? "text-orange-50" : "text-gray-600"}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={`/checkout?plan=${plan.id}`}>
        <Button
          size="lg"
          className={`w-full ${plan.popular ? "bg-white !text-[#FF6B00] hover:bg-orange-50 border-white font-bold" : ""}`}
          variant={plan.popular ? "outline" : "primary"}
        >
          Get Started
        </Button>
      </Link>
    </motion.div>
  );
}

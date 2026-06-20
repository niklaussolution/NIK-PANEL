"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Cpu, MemoryStick, HardDrive, Wifi } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/animations/Reveal";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { VPS_PLANS } from "@/lib/plans";

interface PlanDisplay {
  id: string;
  name: string;
  tagline: string;
  price: number | null; // null = loading
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  features: string[];
  recommended: boolean;
}

const STATIC_META: Record<string, { tagline: string; features: string[]; recommended: boolean }> = {
  starter: {
    tagline: "For personal sites & small projects",
    features: [
      "Free SSL certificate",
      "Weekly backups",
      "1-click app install",
      "24/7 support",
    ],
    recommended: false,
  },
  professional: {
    tagline: "For growing businesses & teams",
    features: [
      "Everything in Starter",
      "Daily backups",
      "Free domain (1 yr)",
      "Priority support",
      "DDoS protection",
    ],
    recommended: true,
  },
  enterprise: {
    tagline: "For high-traffic, mission-critical apps",
    features: [
      "Everything in Professional",
      "Hourly backups",
      "Dedicated IP",
      "Managed migration",
      "99.9% SLA",
    ],
    recommended: false,
  },
};

function buildPlans(prices: Record<string, number> | null): PlanDisplay[] {
  return VPS_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    cpu: p.cpu,
    ram: p.ram,
    storage: p.storage,
    bandwidth: p.bandwidth,
    price: prices ? (prices[p.id] ?? p.price) : null,
    ...STATIC_META[p.id],
  }));
}

export default function VPSPlans() {
  const [plans, setPlans] = useState<PlanDisplay[]>(buildPlans(null));

  useEffect(() => {
    getDocs(collection(db, "plans"))
      .then((snap) => {
        if (snap.empty) {
          // Firestore not seeded yet — use static prices
          setPlans(buildPlans({}));
          return;
        }
        const prices: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (typeof data.price === "number") prices[d.id] = data.price;
          // Also pick up any name/spec overrides the admin may have set
        });
        setPlans(buildPlans(prices));
      })
      .catch(() => {
        // Network error or missing Firebase config — show static prices
        setPlans(buildPlans({}));
      });
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
            VPS Hosting Plans
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Power and pricing that scales with you
          </h2>
          <p className="mt-3 text-gray-500">
            Transparent monthly pricing. No hidden fees. Upgrade or downgrade anytime.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10 }}
              className={`group relative flex flex-col rounded-2xl border p-7 bg-white transition-[box-shadow,border-color] duration-300 will-change-transform ${
                plan.recommended
                  ? "border-[#FF6B00] shadow-card-hover lg:scale-[1.03] hover:shadow-[0_30px_60px_-12px_rgba(255,107,0,0.30)]"
                  : "border-gray-200 hover:border-[#FF6B00]/40 hover:shadow-card-hover"
              }`}
            >
              {/* top accent bar */}
              <span
                className={`absolute top-0 left-7 right-7 h-1 rounded-b-full bg-gradient-to-r from-[#FF6B00] to-[#0066FF] origin-left transition-transform duration-300 ${
                  plan.recommended ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />

              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-[#FF6B00] px-4 py-1 rounded-full shadow-sm">
                  Recommended
                </span>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500 min-h-[40px]">{plan.tagline}</p>

              {/* Price — shows skeleton bar while Firestore loads */}
              <div className="mt-5 flex items-baseline gap-1 min-h-[3rem]">
                {plan.price === null ? (
                  <div className="h-9 w-28 rounded-lg bg-gray-100 animate-pulse" />
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#FF6B00]">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-gray-400">/month</span>
                  </>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Cpu, label: plan.cpu },
                  { icon: MemoryStick, label: plan.ram },
                  { icon: HardDrive, label: plan.storage },
                  { icon: Wifi, label: plan.bandwidth },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2 text-sm text-gray-600">
                    <spec.icon className="w-4 h-4 text-[#0066FF] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span>{spec.label}</span>
                  </div>
                ))}
              </div>

              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-7 block">
                <Button
                  size="lg"
                  variant={plan.recommended ? "primary" : "outline"}
                  className="w-full transition-transform duration-200 group-hover:-translate-y-0.5"
                >
                  Choose {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

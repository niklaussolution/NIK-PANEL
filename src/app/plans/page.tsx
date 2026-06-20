"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Cpu, MemoryStick, HardDrive, Wifi } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/animations/Reveal";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { VPS_PLANS } from "@/lib/plans";

interface PlanDisplay {
  id: string;
  name: string;
  tagline: string;
  price: number | null;
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

function buildPlans(prices: Record<string, number> | null, popular: Record<string, boolean> | null): PlanDisplay[] {
  return VPS_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    cpu: p.cpu,
    ram: p.ram,
    storage: p.storage,
    bandwidth: p.bandwidth,
    ...STATIC_META[p.id],
    price: prices ? (prices[p.id] ?? p.price) : null,
    recommended: popular
      ? (popular[p.id] ?? STATIC_META[p.id]?.recommended ?? false)
      : (STATIC_META[p.id]?.recommended ?? false),
  }));
}

const INCLUDED = [
  "AlmaLinux 9 pre-installed",
  "CyberPanel Control Panel",
  "Docker Engine pre-configured",
  "Full root access",
  "KVM virtualization",
  "DDoS protection",
  "99.9% Uptime SLA",
  "24/7 expert support",
];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanDisplay[]>(buildPlans(null, null));

  useEffect(() => {
    getDocs(collection(db, "plans"))
      .then((snap) => {
        if (snap.empty) {
          setPlans(buildPlans({}, {}));
          return;
        }
        const prices: Record<string, number> = {};
        const popular: Record<string, boolean> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (typeof data.price === "number") prices[d.id] = data.price;
          if (typeof data.popular === "boolean") popular[d.id] = data.popular;
        });
        setPlans(buildPlans(prices, popular));
      })
      .catch(() => setPlans(buildPlans({}, {})));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Page header */}
        <section className="pt-32 pb-16 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Reveal>
              <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
                VPS Hosting Plans
              </span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Power and pricing that scales with you
              </h1>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Transparent monthly pricing. No hidden fees. Upgrade or downgrade anytime.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Plan cards — same template as homepage section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
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
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-[#FF6B00] px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                      Recommended
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 min-h-[40px]">{plan.tagline}</p>

                  {/* Price — skeleton while Firestore loads */}
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

                  {/* Specs */}
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

                  {/* Features */}
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/checkout?plan=${plan.id}`} className="mt-7 block">
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

            {/* Trust row */}
            <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
              {["No setup fees", "Cancel anytime", "30-day money-back guarantee"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {t}
                </span>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Included in every plan */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Included in every plan</h2>
              <p className="mt-2 text-gray-500">Everything pre-configured and ready to use immediately.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INCLUDED.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#FF6B00]" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Button from "@/components/ui/Button";
import { VPS_PLANS } from "@/lib/plans";
import { VPSPlan } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PlansPreview() {
  const [plans, setPlans] = useState<VPSPlan[]>(VPS_PLANS);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snap = await getDocs(collection(db, "plans"));
        if (!snap.empty) {
          setPlans(snap.docs.map((d) => d.data() as VPSPlan));
        }
      } catch {
        // keep static fallback
      }
    };
    fetchPlans();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">Pricing</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-500">
              All plans include AlmaLinux 9, CyberPanel, and Docker pre-installed.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-[16px] border p-6 h-full flex flex-col ${
                  plan.popular
                    ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg"
                    : "bg-white text-gray-900 border-gray-200 shadow-card hover:shadow-card-hover"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={`text-base font-semibold mb-1 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                      ₹{plan.price}
                    </span>
                    <span className={`text-sm mb-1 ${plan.popular ? "text-orange-100" : "text-gray-400"}`}>
                      /mo
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {[plan.cpu, plan.ram, plan.storage, `${plan.bandwidth} Bandwidth`].map((spec) => (
                    <li key={spec} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? "bg-white/20" : "bg-orange-50"}`}>
                        <Check className={`w-2.5 h-2.5 ${plan.popular ? "text-white" : "text-[#FF6B00]"}`} />
                      </div>
                      <span className={`text-sm ${plan.popular ? "text-orange-50" : "text-gray-600"}`}>{spec}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/checkout?plan=${plan.id}`}>
                  <Button
                    variant={plan.popular ? "secondary" : "outline"}
                    className={`w-full ${plan.popular ? "bg-white !text-[#FF6B00] hover:bg-gray-50 border-white" : ""}`}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="text-center mt-10">
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#FF6B00] hover:text-[#E56000] transition-colors"
            >
              See full plan details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlanCard from "@/components/plans/PlanCard";
import FadeIn from "@/components/animations/FadeIn";
import { VPSPlan } from "@/types";
import { VPS_PLANS } from "@/lib/plans";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Check } from "lucide-react";

const STACK = [
  "AlmaLinux 9",
  "CyberPanel Control Panel",
  "Docker Engine",
  "Full Root Access",
  "KVM Virtualization",
  "DDoS Protection",
  "99.9% Uptime SLA",
  "24/7 Support",
];

export default function PlansPage() {
  const [plans, setPlans] = useState<VPSPlan[]>(VPS_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snap = await getDocs(collection(db, "plans"));
        if (!snap.empty) {
          setPlans(snap.docs.map((d) => d.data() as VPSPlan));
        }
      } catch {
        // fallback to static plans
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">VPS Plans</span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
                Choose your VPS plan
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                All plans include AlmaLinux 9, CyberPanel, and Docker pre-installed.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {plans.map((plan, i) => (
                  <PlanCard key={plan.id} plan={plan} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* What's included */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">Included in every plan</h2>
                <p className="mt-2 text-gray-500">Everything pre-configured, ready to use immediately.</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-card p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STACK.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#FF6B00]" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

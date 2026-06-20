"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Server, Check, Lock, RefreshCw, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { VPS_PLANS } from "@/lib/plans";
import { VPSPlan } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: new (options: RazorpaySubOptions) => RazorpayInstance;
  }
}
interface RazorpaySubOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpaySubResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open(): void; }
interface RazorpaySubResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

// ── Real SVG logos for each stack ────────────────────────────────────────────
const STACKS = [
  {
    value: "CyberPanel",
    label: "CyberPanel",
    desc: "Web hosting control panel",
    logo: "/assets/icons/cyberpanel.svg",
    bg: "#0d6b3f",
  },
  {
    value: "Docker",
    label: "Docker",
    desc: "Container runtime",
    logo: "/assets/icons/docker.svg",
    bg: "#f0f8ff",
  },
  {
    value: "Ubuntu",
    label: "Ubuntu",
    desc: "Clean Ubuntu 22.04 LTS",
    logo: "/assets/icons/ubuntu.svg",
    bg: "#fff3ee",
  },
];

function StackLogo({ logo, bg, label }: { logo: string; bg: string; label: string }) {
  return (
    <span
      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <Image src={logo} alt={label} width={22} height={22} className="object-contain" />
    </span>
  );
}

function StackDropdown({ value, onChange, error }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = STACKS.find((s) => s.value === value) || STACKS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Stack</label>
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-3 rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all duration-200 ${
            open
              ? "border-[#FF6B00] ring-2 ring-[#FF6B00]/20"
              : error
              ? "border-red-400"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-3">
            <StackLogo logo={selected.logo} bg={selected.bg} label={selected.label} />
            <span className="font-medium">{selected.label}</span>
            <span className="text-gray-400 text-xs hidden sm:inline">{selected.desc}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Options panel */}
        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-[12px] border border-gray-100 bg-white shadow-lg overflow-hidden">
            {STACKS.map((stack) => (
              <button
                key={stack.value}
                type="button"
                onClick={() => { onChange(stack.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-left text-sm transition-colors duration-150 ${
                  stack.value === value
                    ? "bg-orange-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <StackLogo logo={stack.logo} bg={stack.bg} label={stack.label} />
                <span className="flex flex-col flex-1">
                  <span className={`font-semibold leading-tight ${stack.value === value ? "text-[#FF6B00]" : "text-gray-900"}`}>
                    {stack.label}
                  </span>
                  <span className="text-xs text-gray-400">{stack.desc}</span>
                </span>
                {stack.value === value && (
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CheckoutContent() {
  const searchParams  = useSearchParams();
  const planId        = searchParams.get("plan") || "starter";
  const router        = useRouter();
  const { currentUser, userData } = useAuth();

  const [plan, setPlan]   = useState<VPSPlan | null>(null);
  const [form, setForm]   = useState({ fullName: "", email: "", phone: "", os: "CyberPanel" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch live plan from Firestore
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const snap = await getDoc(doc(db, "plans", planId));
        setPlan(snap.exists() ? (snap.data() as VPSPlan) : VPS_PLANS.find((p) => p.id === planId) || VPS_PLANS[0]);
      } catch {
        setPlan(VPS_PLANS.find((p) => p.id === planId) || VPS_PLANS[0]);
      }
    };
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        fullName: userData?.name || currentUser.displayName || "",
        email:    currentUser.email || "",
        phone:    userData?.phone   || "",
      }));
    }
  }, [currentUser, userData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())                             e.fullName = "Full name is required";
    if (!form.email.trim())                                e.email    = "Email is required";
    if (!form.phone.trim())                                e.phone    = "Phone number is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(form.phone))       e.phone    = "Enter a valid phone number";
    if (!form.os)                                          e.os       = "Please select a stack";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src     = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!currentUser) {
      toast.error("Please log in to continue");
      router.push("/login");
      return;
    }
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load");

      // Create Razorpay Subscription
      const { data } = await axios.post("/api/create-subscription", {
        planId:          plan?.id,
        planName:        plan?.name,
        amount:          plan?.price,
        userId:          currentUser.uid,
        customerName:    form.fullName,
        customerEmail:   form.email,
        customerPhone:   form.phone,
        os:              form.os,
      });

      const options: RazorpaySubOptions = {
        key:             process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: data.subscriptionId,
        name:            "NIKPanel",
        description:     `${plan?.name} — ₹${plan?.price}/month (Auto-renewed)`,
        handler: async (response: RazorpaySubResponse) => {
          try {
            await axios.post("/api/verify-subscription", {
              ...response,
              userId:          currentUser.uid,
              planId:          plan?.id,
              planName:        plan?.name,
              amount:          plan?.price,
              os:              form.os,
              customerName:    form.fullName,
              customerEmail:   form.email,
              customerPhone:   form.phone,
            });
            toast.success("🎉 Payment successful! Your VPS is being provisioned.");
            router.push("/dashboard/vps");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme:   { color: "#FF6B00" },
        modal:   { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (!plan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6B00] rounded-[8px] flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">NIK<span className="text-[#FF6B00]">Panel</span></span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Your Information</h1>
              <p className="text-sm text-gray-400 mb-6">You'll be charged ₹{plan.price}/month automatically via UPI, card, or netbanking.</p>

              <form onSubmit={handleCheckout} className="space-y-4">
                <Input label="Full Name"       type="text"  placeholder="John Doe"          value={form.fullName} error={errors.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                <Input label="Email Address"   type="email" placeholder="john@example.com"  value={form.email}    error={errors.email}    onChange={(e) => setForm({ ...form, email:    e.target.value })} />
                <Input label="Phone Number"    type="tel"   placeholder="+91 98765 43210"   value={form.phone}    error={errors.phone}    onChange={(e) => setForm({ ...form, phone:    e.target.value })} />
                <StackDropdown
                  value={form.os}
                  onChange={(v) => setForm({ ...form, os: v })}
                  error={errors.os}
                />

                {!currentUser && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-[12px] text-sm text-[#FF6B00]">
                    <Link href="/login" className="font-semibold underline">Log in</Link> or{" "}
                    <Link href="/register" className="font-semibold underline">create an account</Link> to complete your purchase.
                  </div>
                )}

                {/* Auto-pay notice */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-[12px]">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-4 h-4 text-[#0066FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Monthly Auto-Pay enabled</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ₹{plan.price} will be auto-debited every month. You can cancel anytime from your dashboard. No hidden charges.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Payments secured by Razorpay. UPI AutoPay / Card / Netbanking supported.</span>
                </div>

                <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                  {loading ? "Processing..." : `Subscribe — ₹${plan.price}/month`}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-card p-6 sticky top-8">
              <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Monthly subscription</p>
                  </div>
                  {plan.popular && (
                    <span className="text-xs bg-orange-100 text-[#FF6B00] font-medium px-2 py-0.5 rounded-full flex-shrink-0">Popular</span>
                  )}
                </div>
                {[
                  { label: "CPU",       value: plan.cpu },
                  { label: "RAM",       value: plan.ram },
                  { label: "Storage",   value: plan.storage },
                  { label: "Bandwidth", value: plan.bandwidth },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm py-1">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-medium text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-5">
                {["AlmaLinux 9", form.os, "Full Root Access", "KVM Virtualization"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#FF6B00]" />
                    </div>
                    {item} included
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Monthly total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Billed every month</span>
                  <span className="text-xs text-green-600 font-medium">Cancel anytime</span>
                </div>
              </div>

              {/* Auto-pay badge */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-[10px] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                <span className="text-xs text-blue-700 font-medium">Auto-renewed monthly via Razorpay</span>
              </div>

              <div className="mt-3 p-3 bg-green-50 rounded-[10px] flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs text-green-700 font-medium">Instant provisioning after payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

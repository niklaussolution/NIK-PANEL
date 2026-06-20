"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/animations/Reveal";

const faqs = [
  {
    q: "What is included with my VPS plan?",
    a: "Every plan comes with full root access, NVMe SSD storage, free SSL, DDoS protection, automated backups and 24/7 expert support. You also get our one-click app installer for WordPress, Docker and more.",
  },
  {
    q: "How fast can I get my server online?",
    a: "Instantly. Once your order is confirmed, your fully configured server is provisioned and ready to use in under 60 seconds.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Yes. All plans include a 30-day money-back guarantee. If you're not satisfied for any reason, we'll issue a full refund — no questions asked.",
  },
  {
    q: "Can I upgrade or downgrade my plan later?",
    a: "Absolutely. You can scale your resources up or down at any time directly from your dashboard, with no downtime and prorated billing.",
  },
  {
    q: "Will you help me migrate from my current host?",
    a: "Yes. Our team offers free, fully-managed migrations on Professional and Enterprise plans, and step-by-step guidance on all others.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="text-sm font-semibold text-[#FF6B00] uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-gray-500">
            Everything you need to know before getting started.
          </p>
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-gray-900">{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#FF6B00]" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

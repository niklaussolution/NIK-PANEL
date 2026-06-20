import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/animations/FadeIn";
import { Server, Users, Globe, Award } from "lucide-react";

const values = [
  { icon: Server, title: "Performance First", desc: "We invest in the latest NVMe SSD hardware and KVM virtualization to deliver maximum performance for every workload." },
  { icon: Users, title: "Customer Focused", desc: "Our support team is available 24/7. We treat every customer with the same care and urgency, regardless of plan size." },
  { icon: Globe, title: "Transparent Pricing", desc: "No hidden fees, no surprise billing. What you see on the pricing page is exactly what you pay, every month." },
  { icon: Award, title: "Reliability Guaranteed", desc: "We back our infrastructure with a 99.9% uptime SLA and proactive monitoring so you can focus on your business." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <section className="py-24 bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">About NIKPanel</span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
                Hosting built by developers, for developers
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                NIKPanel was founded with a simple mission: provide reliable, high-performance VPS hosting without the complexity and bloat of traditional hosting companies.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose text-gray-600 space-y-4 leading-relaxed">
                <p>
                  NIKPanel started as a solution to a real problem: finding VPS hosting that was both powerful and simple to use. We were tired of overly complex control panels, shared resources, and unpredictable performance.
                </p>
                <p>
                  We built NIKPanel around three principles — performance, simplicity, and reliability. Every VPS we provision comes with AlmaLinux 9, CyberPanel, and Docker pre-installed so developers and businesses can get up and running in minutes.
                </p>
                <p>
                  KVM virtualization ensures your resources are truly dedicated. NVMe SSD storage means your applications run fast. And our team is always available when you need support.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {values.map((v, i) => (
                <FadeIn key={v.title} delay={i * 0.1}>
                  <div className="bg-white border border-gray-100 rounded-[16px] shadow-card p-6">
                    <div className="w-10 h-10 bg-orange-50 rounded-[10px] flex items-center justify-center mb-4">
                      <v.icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

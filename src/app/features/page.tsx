import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Features from "@/components/home/Features";
import FadeIn from "@/components/animations/FadeIn";
import { HardDrive, Cpu, Terminal, LayoutDashboard, Box, ShieldCheck, Activity, Network } from "lucide-react";

const techStack = [
  { name: "AlmaLinux 9", desc: "Enterprise-grade Linux OS, RHEL compatible, long-term support." },
  { name: "CyberPanel", desc: "Modern web hosting control panel powered by OpenLiteSpeed." },
  { name: "Docker Engine", desc: "Container platform pre-configured and ready to deploy workloads." },
  { name: "KVM Hypervisor", desc: "Hardware-level virtualization with dedicated resource allocation." },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">Platform Features</span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
                Built for performance & reliability
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                Every component of NIKPanel is optimized for production workloads.
              </p>
            </FadeIn>
          </div>
        </section>

        <Features />

        {/* Tech Stack */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Default VPS Stack</h2>
                <p className="mt-3 text-gray-500">Every VPS ships with this production-ready stack — no additional setup needed.</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {techStack.map((item, i) => (
                <FadeIn key={item.name} delay={i * 0.1}>
                  <div className="bg-gray-50 border border-gray-100 rounded-[16px] p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Network */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Network Infrastructure</h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: "Network Speed", value: "10 Gbps", icon: Network },
                { label: "DDoS Mitigation", value: "1 Tbps+", icon: ShieldCheck },
                { label: "Uptime SLA", value: "99.9%", icon: Activity },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.1}>
                  <div className="bg-white border border-gray-100 rounded-[16px] shadow-card p-6 text-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-[12px] flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-[#FF6B00]" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
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

"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/animations/FadeIn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@nikhosting.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: Clock, label: "Support Hours", value: "24/7 Available" },
  { icon: MessageSquare, label: "Live Chat", value: "Available in Dashboard" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll respond within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">Contact Us</span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
                We're here to help
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                Have a question or need help? Our team responds within 24 hours.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Info */}
              <FadeIn direction="left">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Get in touch</h2>
                    <p className="text-sm text-gray-500">Fill out the form or reach us directly through any of the channels below.</p>
                  </div>
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-[12px] border border-gray-100">
                      <div className="w-9 h-9 bg-orange-50 rounded-[8px] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-[#FF6B00]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Form */}
              <FadeIn direction="right" className="lg:col-span-2">
                <div className="bg-white border border-gray-100 rounded-[20px] shadow-card p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Send a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Describe your question or issue..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-[12px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder:text-gray-400"
                      />
                    </div>
                    <Button type="submit" loading={loading} size="lg">
                      Send Message
                    </Button>
                  </form>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

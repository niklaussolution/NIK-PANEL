import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { assets } from "@/lib/assets";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src={assets.icons.logo}
                alt="Niklaus Solution logo"
                width={180}
                height={72}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              High-performance KVM VPS hosting with CyberPanel and Docker pre-installed. Built for developers and businesses.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4 text-[#FF6B00]" />
              <span>niklaussolution@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="w-4 h-4 text-[#FF6B00]" />
              <span>+91 8438516533</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/plans", label: "Starter VPS" },
                { href: "/plans", label: "Business VPS" },
                { href: "/plans", label: "Professional VPS" },
                { href: "/plans", label: "Enterprise VPS" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/features", label: "Features" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/dashboard/support", label: "Open Ticket" },
                { href: "/login", label: "Client Area" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NIKPanel. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">SLA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

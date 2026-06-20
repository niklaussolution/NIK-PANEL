import React from "react";
import { Mail, Phone } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden md:block bg-[#0B1220] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 text-xs">
          <a
            href="mailto:support@nikpanel.com"
            className="inline-flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
            support@nikpanel.com
          </a>
          <div className="flex items-center gap-6">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
              +91 98765 43210
            </a>
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              99.9% Uptime · 24/7 Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

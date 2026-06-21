"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { assets } from "@/lib/assets";
import { clsx } from "clsx";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/plans", label: "VPS Plans" },
  { href: "/features", label: "Features" },
  { href: "/plans", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <TopBar />
      <nav
        className={clsx(
          "transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100/60"
        )}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src={assets.icons.logo}
              alt="Niklaus Solution logo"
              width={180}
              height={72}
              className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-[8px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                {currentUser ? (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full" size="sm">Login</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full" size="sm">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

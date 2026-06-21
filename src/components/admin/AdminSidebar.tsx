"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, Server,
  Package, LogOut, Terminal,
  Menu, X, ChevronRight, Shield, CreditCard,
} from "lucide-react";
import { assets } from "@/lib/assets";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin",          label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/users",    label: "Users",        icon: Users },
  { href: "/admin/payments", label: "Payments",     icon: CreditCard },
  { href: "/admin/orders",   label: "Orders",       icon: ShoppingCart },
  { href: "/admin/vps",      label: "VPS Mgmt",     icon: Server },
  { href: "/admin/plans",    label: "Plans",        icon: Package },
  { href: "/admin/commands", label: "Commands",     icon: Terminal },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userData, currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/admin" className="flex flex-col gap-1.5">
          <Image src={assets.icons.logo} alt="Niklaus Solution" width={160} height={64} className="h-12 w-auto brightness-0 invert" />
          <div className="flex items-center gap-1">
            <Shield className="w-2.5 h-2.5 text-orange-400" />
            <span className="text-[10px] text-orange-400 font-semibold tracking-wide uppercase">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all group",
                active ? "bg-[#FF6B00]/15 text-[#FF6B00]" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}>
              <item.icon className={clsx("w-4 h-4 flex-shrink-0", active ? "text-[#FF6B00]" : "text-gray-500 group-hover:text-gray-300")} />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 text-[#FF6B00] ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-white/5">
          <div className="w-7 h-7 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(userData?.name || currentUser?.displayName || "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userData?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-gray-800 border border-gray-700 rounded-[10px] flex items-center justify-center shadow-sm">
        <Menu className="w-4 h-4 text-gray-300" />
      </button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 border-r border-gray-800 shadow-xl transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
        <Content />
      </div>
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
        <Content />
      </aside>
    </>
  );
}

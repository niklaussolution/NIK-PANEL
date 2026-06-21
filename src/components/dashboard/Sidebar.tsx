"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  CreditCard,
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { assets } from "@/lib/assets";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders",    icon: ShoppingCart },
  { href: "/dashboard/vps",    label: "My VPS",    icon: Server },
  { href: "/dashboard/billing",  label: "Billing", icon: CreditCard },
  { href: "/dashboard/support",  label: "Support", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Settings",icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userData, currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/">
          <Image src={assets.icons.logo} alt="Niklaus Solution" width={160} height={64} className="h-12 w-auto" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-orange-50 text-[#FF6B00]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-[#FF6B00]" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {item.label}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-[#FF6B00] ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-gray-50">
          <div className="w-7 h-7 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(userData?.name || currentUser?.displayName || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userData?.name || currentUser?.displayName || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-white border border-gray-200 rounded-[10px] flex items-center justify-center shadow-sm"
      >
        <Menu className="w-4 h-4 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 shadow-xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Lock, Bell } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { currentUser, userData } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userData || currentUser) {
      setProfileForm({
        name: userData?.name || currentUser?.displayName || "",
        email: currentUser?.email || "",
        phone: userData?.phone || "",
      });
    }
  }, [userData, currentUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error("Name is required");
    if (!currentUser) return;
    setProfileLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!passwordForm.current) errs.current = "Current password is required";
    if (passwordForm.newPass.length < 8) errs.newPass = "Password must be at least 8 characters";
    if (passwordForm.newPass !== passwordForm.confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!currentUser?.email) return;

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.current);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordForm.newPass);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      toast.success("Password updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setErrors({ current: "Current password is incorrect" });
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-orange-50 rounded-[8px] flex items-center justify-center">
              <User className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profileForm.name[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{profileForm.name || "User"}</p>
                <p className="text-xs text-gray-400">{profileForm.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              <Input label="Email Address" type="email" value={profileForm.email} disabled
                helperText="Email cannot be changed" />
            </div>
            <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            <Button type="submit" loading={profileLoading} size="sm">Save Changes</Button>
          </form>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-blue-50 rounded-[8px] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#0066FF]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <Input label="Current Password" type="password" value={passwordForm.current} error={errors.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            <Input label="New Password" type="password" value={passwordForm.newPass} error={errors.newPass}
              helperText="Minimum 8 characters"
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
            <Input label="Confirm New Password" type="password" value={passwordForm.confirm} error={errors.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            <Button type="submit" variant="secondary" loading={passwordLoading} size="sm">Update Password</Button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-purple-50 rounded-[8px] flex items-center justify-center">
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Payment receipts", sub: "Get emailed when a payment is processed", defaultOn: true },
              { label: "Server alerts", sub: "Be notified if your VPS goes offline", defaultOn: true },
              { label: "Support updates", sub: "Ticket replies and status changes", defaultOn: true },
              { label: "Product announcements", sub: "New features and updates from NIKPanel", defaultOn: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#FF6B00] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

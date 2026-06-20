"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Check, Pencil, X, Save, Loader2, Star
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, setDoc, updateDoc
} from "firebase/firestore";
import { VPS_PLANS } from "@/lib/plans";
import { VPSPlan } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<VPSPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<VPSPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Load plans from Firestore, fallback to static if not seeded yet
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "plans"));
      if (snap.empty) {
        // Seed Firestore with default plans on first load
        await seedPlans();
        setPlans(VPS_PLANS);
      } else {
        setPlans(snap.docs.map((d) => d.data() as VPSPlan));
      }
    } catch {
      setPlans(VPS_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const seedPlans = async () => {
    for (const plan of VPS_PLANS) {
      await setDoc(doc(db, "plans", plan.id), plan);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan: VPSPlan) => {
    setEditingPlan({ ...plan });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "plans", editingPlan.id), {
        name: editingPlan.name,
        cpu: editingPlan.cpu,
        ram: editingPlan.ram,
        storage: editingPlan.storage,
        bandwidth: editingPlan.bandwidth,
        price: Number(editingPlan.price),
        popular: editingPlan.popular ?? false,
      });
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
      );
      toast.success(`${editingPlan.name} updated successfully`);
      setEditingPlan(null);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof VPSPlan, label: string, type = "text") => (
    <Input
      label={label}
      type={type}
      value={String(editingPlan?.[key] ?? "")}
      onChange={(e) =>
        setEditingPlan((prev) =>
          prev ? { ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value } : prev
        )
      }
    />
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">VPS Plans</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit plan pricing and specifications. Changes go live immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden"
          >
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-50 rounded-[8px] flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {plan.popular && <Badge variant="warning">Popular</Badge>}
                <button
                  onClick={() => openEdit(plan)}
                  className="w-7 h-7 flex items-center justify-center rounded-[8px] text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="text-3xl font-bold text-gray-900 mb-0.5">₹{plan.price}</div>
              <div className="text-xs text-gray-400 mb-5">/month</div>

              <div className="space-y-2.5 mb-5">
                {[
                  { label: "CPU",       value: plan.cpu },
                  { label: "RAM",       value: plan.ram },
                  { label: "Storage",   value: plan.storage },
                  { label: "Bandwidth", value: plan.bandwidth },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-xs font-semibold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-50 space-y-1.5">
                {["AlmaLinux 9", "CyberPanel", "Docker"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => openEdit(plan)}
              >
                <Pencil className="w-3 h-3" />
                Edit Plan
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-blue-50 border border-blue-100 rounded-[16px] p-5 flex items-start gap-3"
      >
        <div className="w-5 h-5 bg-[#0066FF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">i</span>
        </div>
        <p className="text-sm text-gray-600">
          Plan changes save instantly to Firestore and are reflected on the public VPS Plans page for new customers. Existing orders are not affected.
        </p>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPlan && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setEditingPlan(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-[20px] shadow-xl w-full max-w-md overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-[10px] flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Edit Plan</h2>
                      <p className="text-xs text-gray-400">{editingPlan.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !saving && setEditingPlan(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-[8px] text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal body */}
                <div className="px-6 py-5 space-y-4">
                  {field("name", "Plan Name")}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Price (₹/month)"
                      type="number"
                      value={String(editingPlan.price)}
                      onChange={(e) =>
                        setEditingPlan((p) => p ? { ...p, price: Number(e.target.value) } : p)
                      }
                    />
                    {field("cpu", "CPU")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {field("ram", "RAM")}
                    {field("storage", "Storage")}
                  </div>

                  {field("bandwidth", "Bandwidth")}

                  {/* Popular toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                    </div>
                    <button
                      onClick={() =>
                        setEditingPlan((p) => p ? { ...p, popular: !p.popular } : p)
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        editingPlan.popular ? "bg-[#FF6B00]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          editingPlan.popular ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setEditingPlan(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleSave}
                    loading={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

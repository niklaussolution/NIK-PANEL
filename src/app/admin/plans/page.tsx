"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Check, Pencil, X, Save, Star,
  Trash2, Plus, Eye, EyeOff, Tag, AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
} from "firebase/firestore";
import { VPS_PLANS } from "@/lib/plans";
import { VPSPlan } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const CANONICAL_IDS = VPS_PLANS.map((p) => p.id);

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const BLANK: Omit<VPSPlan, "id"> = {
  name: "", cpu: "", ram: "", storage: "", bandwidth: "",
  price: 0, popular: false, disabled: false, couponCode: "", couponDiscount: 0,
};

// ── Shared form used in both Add and Edit modals ─────────────────────────────
function PlanForm({
  value,
  onChange,
}: {
  value: Omit<VPSPlan, "id">;
  onChange: (u: Omit<VPSPlan, "id">) => void;
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <Input label="Plan Name" placeholder="Enterprise" value={value.name} onChange={(e) => set("name", e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Price (₹/month)" type="number" value={String(value.price)} onChange={(e) => set("price", Number(e.target.value))} />
        <Input label="CPU" placeholder="4 vCPU" value={value.cpu} onChange={(e) => set("cpu", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="RAM" placeholder="8 GB RAM" value={value.ram} onChange={(e) => set("ram", e.target.value)} />
        <Input label="Storage" placeholder="60 GB NVMe SSD" value={value.storage} onChange={(e) => set("storage", e.target.value)} />
      </div>

      <Input label="Bandwidth" placeholder="8 TB" value={value.bandwidth} onChange={(e) => set("bandwidth", e.target.value)} />

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Popular */}
        <button
          type="button"
          onClick={() => set("popular", !value.popular)}
          className={`flex items-center justify-between p-3 rounded-[12px] border transition-colors duration-200 text-left ${
            value.popular
              ? "bg-orange-50 border-orange-200"
              : "bg-gray-50 border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${value.popular ? "text-[#FF6B00]" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${value.popular ? "text-[#FF6B00]" : "text-gray-600"}`}>
              Popular
            </span>
          </div>
          {/* Toggle pill */}
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              value.popular ? "bg-[#FF6B00]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                value.popular ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>

        {/* Hidden */}
        <button
          type="button"
          onClick={() => set("disabled", !value.disabled)}
          className={`flex items-center justify-between p-3 rounded-[12px] border transition-colors duration-200 text-left ${
            value.disabled
              ? "bg-red-50 border-red-200"
              : "bg-gray-50 border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <EyeOff className={`w-4 h-4 ${value.disabled ? "text-red-500" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${value.disabled ? "text-red-500" : "text-gray-600"}`}>
              Hidden
            </span>
          </div>
          {/* Toggle pill */}
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              value.disabled ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                value.disabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Coupon code section */}
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-[12px] space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#FF6B00]" />
          <span className="text-sm font-semibold text-gray-800">Coupon Code</span>
          <span className="text-xs text-gray-400">(optional)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Code"
            placeholder="e.g. SAVE20"
            value={value.couponCode ?? ""}
            onChange={(e) => set("couponCode", e.target.value.toUpperCase())}
          />
          <Input
            label="Discount %"
            type="number"
            placeholder="20"
            value={String(value.couponDiscount ?? 0)}
            onChange={(e) =>
              set("couponDiscount", Math.min(100, Math.max(0, Number(e.target.value))))
            }
          />
        </div>
        {value.couponCode && Number(value.couponDiscount) > 0 ? (
          <p className="text-xs text-[#FF6B00] font-medium">
            Code <strong>{value.couponCode}</strong> gives{" "}
            <strong>{value.couponDiscount}%</strong> off — saves ₹
            {Math.round((Number(value.price) * Number(value.couponDiscount)) / 100)}/month
          </p>
        ) : (
          <p className="text-xs text-gray-400">Leave empty to disable coupon for this plan.</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPlansPage() {
  const [plans, setPlans] = useState<VPSPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPlan, setEditingPlan] = useState<VPSPlan | null>(null);
  const [editForm, setEditForm] = useState<Omit<VPSPlan, "id">>(BLANK);

  const [addingPlan, setAddingPlan] = useState(false);
  const [newForm, setNewForm] = useState<Omit<VPSPlan, "id">>(BLANK);

  const [confirmDelete, setConfirmDelete] = useState<VPSPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch & auto-clean ─────────────────────────────────────────────────────
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "plans"));
      if (snap.empty) {
        await seedPlans();
        setPlans(
          VPS_PLANS.map((p) => ({ ...p, disabled: false, couponCode: "", couponDiscount: 0 }))
        );
        setLoading(false);
        return;
      }

      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VPSPlan));

      // Delete legacy plans (IDs that look like "starter-vps" or names ending " VPS"
      // that are not in the canonical 3)
      const legacy = all.filter(
        (p) =>
          !CANONICAL_IDS.includes(p.id) &&
          (p.id.includes("-vps") || (p.name ?? "").endsWith(" VPS"))
      );
      for (const leg of legacy) await deleteDoc(doc(db, "plans", leg.id));

      let remaining = all.filter((p) => !legacy.some((l) => l.id === p.id));

      // Ensure canonical plans exist in Firestore
      for (const canonical of VPS_PLANS) {
        if (!remaining.find((p) => p.id === canonical.id)) {
          const pd: VPSPlan = {
            ...canonical,
            disabled: false,
            couponCode: "",
            couponDiscount: 0,
          };
          await setDoc(doc(db, "plans", canonical.id), pd);
          remaining.push(pd);
        }
      }

      // Sort: canonical first, then custom additions
      remaining.sort((a, b) => {
        const ai = CANONICAL_IDS.indexOf(a.id);
        const bi = CANONICAL_IDS.indexOf(b.id);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return 0;
      });

      setPlans(remaining);
    } catch {
      setPlans(VPS_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const seedPlans = async () => {
    for (const p of VPS_PLANS) {
      await setDoc(doc(db, "plans", p.id), {
        ...p,
        disabled: false,
        couponCode: "",
        couponDiscount: 0,
      });
    }
  };

  useEffect(() => {
    fetchPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (plan: VPSPlan) => {
    setEditingPlan(plan);
    const { id: _id, ...rest } = plan;
    setEditForm({ ...BLANK, ...rest });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      const data: Omit<VPSPlan, "id"> = {
        ...editForm,
        price: Number(editForm.price),
        couponDiscount: Number(editForm.couponDiscount ?? 0),
        popular: editForm.popular ?? false,
        disabled: editForm.disabled ?? false,
      };
      await updateDoc(doc(db, "plans", editingPlan.id), data as Record<string, unknown>);
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { id: editingPlan.id, ...data } : p))
      );
      toast.success(`${data.name} updated`);
      setEditingPlan(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAddPlan = async () => {
    if (!newForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!newForm.price) {
      toast.error("Price is required");
      return;
    }
    const id = slugify(newForm.name) || `plan-${Date.now()}`;
    if (plans.find((p) => p.id === id)) {
      toast.error("A plan with this name already exists");
      return;
    }
    setSaving(true);
    try {
      const planData: VPSPlan = {
        id,
        ...newForm,
        price: Number(newForm.price),
        couponDiscount: Number(newForm.couponDiscount ?? 0),
      };
      await setDoc(doc(db, "plans", id), planData);
      setPlans((prev) => [...prev, planData]);
      toast.success(`${newForm.name} added`);
      setNewForm(BLANK);
      setAddingPlan(false);
    } catch {
      toast.error("Failed to add plan");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "plans", confirmDelete.id));
      setPlans((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      toast.success(`${confirmDelete.name} deleted`);
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle disabled ────────────────────────────────────────────────────────
  const handleToggleDisable = async (plan: VPSPlan) => {
    const newVal = !plan.disabled;
    try {
      await updateDoc(doc(db, "plans", plan.id), { disabled: newVal });
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, disabled: newVal } : p))
      );
      toast.success(`${plan.name} ${newVal ? "hidden from public" : "visible to public"}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VPS Plans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage pricing, specs, coupon codes, and visibility. Changes go live immediately.
          </p>
        </div>
        <Button
          onClick={() => { setNewForm(BLANK); setAddingPlan(true); }}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white rounded-[16px] border shadow-card overflow-hidden ${
              plan.disabled ? "border-gray-200 opacity-60" : "border-gray-100"
            }`}
          >
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${plan.disabled ? "bg-gray-100" : "bg-orange-50"}`}>
                  <Package className={`w-3.5 h-3.5 ${plan.disabled ? "text-gray-400" : "text-[#FF6B00]"}`} />
                </div>
                <span className="text-sm font-semibold text-gray-900 truncate">{plan.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {plan.disabled && <Badge variant="neutral">Hidden</Badge>}
                {plan.popular && !plan.disabled && <Badge variant="warning">Popular</Badge>}

                {/* Toggle visibility */}
                <button
                  onClick={() => handleToggleDisable(plan)}
                  title={plan.disabled ? "Show plan publicly" : "Hide plan from public"}
                  className="w-7 h-7 flex items-center justify-center rounded-[8px] text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {plan.disabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(plan)}
                  className="w-7 h-7 flex items-center justify-center rounded-[8px] text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setConfirmDelete(plan)}
                  className="w-7 h-7 flex items-center justify-center rounded-[8px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="p-5">
              <div className="text-3xl font-bold text-gray-900 mb-0.5">
                ₹{plan.price.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-400 mb-5">/month</div>

              <div className="space-y-2.5 mb-4">
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

              {/* Coupon badge or included features */}
              <div className="pt-4 border-t border-gray-50">
                {plan.couponCode && Number(plan.couponDiscount) > 0 ? (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-[8px]">
                    <Tag className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span className="text-xs text-gray-700">
                      <span className="font-semibold text-[#FF6B00]">{plan.couponCode}</span>
                      {" — "}{plan.couponDiscount}% off
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {["AlmaLinux 9", "CyberPanel", "Docker"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3 text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-5">
              <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => openEdit(plan)}>
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
          Plan changes save instantly to Firestore. Hidden plans are not shown to customers but existing subscribers are unaffected. Coupon codes apply a % discount on the checkout page.
        </p>
      </motion.div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !saving && setEditingPlan(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-white rounded-[20px] shadow-xl w-full max-w-md my-auto">
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
                <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
                  <PlanForm value={editForm} onChange={setEditForm} />
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setEditingPlan(null)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Plan Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {addingPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !saving && setAddingPlan(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-white rounded-[20px] shadow-xl w-full max-w-md my-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-[10px] flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Add New Plan</h2>
                  </div>
                  <button
                    onClick={() => !saving && setAddingPlan(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-[8px] text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
                  <PlanForm value={newForm} onChange={setNewForm} />
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setAddingPlan(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleAddPlan} loading={saving}>
                    <Plus className="w-4 h-4" />
                    Add Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDelete(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-[20px] shadow-xl w-full max-w-sm p-6">
                <div className="w-12 h-12 bg-red-50 rounded-[12px] flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete Plan</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone. Existing subscribers are not affected.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setConfirmDelete(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2 !bg-red-500 hover:!bg-red-600"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Copy, Check, Upload, AlertCircle, ArrowLeft,
  Loader2, ImagePlus, X, FileCheck, Clock, CheckCircle2,
  Smartphone, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UPIOrder } from "@/types";

const UPI_ID   = process.env.NEXT_PUBLIC_UPI_ID   || "nikpanel@upi";
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || "NIKPanel";

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} title={`Copy ${label || text}`}
      className="p-1.5 rounded-[8px] hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: "payment" | "proof" | "confirmed" }) {
  const steps = [
    { id: "payment",   label: "Pay" },
    { id: "proof",     label: "Submit Proof" },
    { id: "confirmed", label: "Done" },
  ] as const;
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${i < idx ? "bg-green-500 text-white" : i === idx ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-400"}`}>
              {i < idx ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:inline ${i === idx ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 sm:w-12 mx-2 transition-colors duration-300 ${i < idx ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── UPI app buttons ───────────────────────────────────────────────────────────
const UPI_APPS = [
  { name: "GPay",     color: "#4285F4", text: "white",   scheme: (url: string) => `tez://upi/pay?${url.split("?")[1]}` },
  { name: "PhonePe",  color: "#5f259f", text: "white",   scheme: (url: string) => `phonepe://pay?${url.split("?")[1]}` },
  { name: "Paytm",    color: "#00BAF2", text: "white",   scheme: (url: string) => `paytmmp://pay?${url.split("?")[1]}` },
  { name: "BHIM",     color: "#00732E", text: "white",   scheme: (url: string) => url },
];

// ── Main content ──────────────────────────────────────────────────────────────
function UPIContent() {
  const searchParams = useSearchParams();
  const orderId      = searchParams.get("order") || "";
  const router       = useRouter();

  const [order, setOrder]     = useState<UPIOrder | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [step, setStep]       = useState<"payment" | "proof" | "confirmed">("payment");
  const [showQR, setShowQR]   = useState(false);

  // Proof form
  const [utr, setUtr]               = useState("");
  const [utrError, setUtrError]     = useState("");
  const [notes, setNotes]           = useState("");
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [fileError, setFileError]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) { setLoadErr("No order ID found."); return; }
    getDoc(doc(db, "orders", orderId)).then((snap) => {
      if (!snap.exists()) { setLoadErr("Order not found."); return; }
      const data = snap.data() as UPIOrder;
      setOrder(data);
      if (data.paymentProof || data.paymentStatus === "Approved") setStep("confirmed");
    }).catch(() => setLoadErr("Failed to load order."));
  }, [orderId]);

  const upiUrl = order
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${order.amount}&tn=${encodeURIComponent(order.orderId)}&cu=INR`
    : "";

  const qrSrc = upiUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=000000&margin=4`
    : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setFileError("Only image files are allowed."); return; }
    if (f.size > 5 * 1024 * 1024)    { setFileError("File size must be under 5 MB.");  return; }
    setFile(f);
    setFileError("");
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasErr = false;
    if (!utr.trim()) { setUtrError("UTR number is required"); hasErr = true; }
    else if (!/^[\dA-Za-z]{6,30}$/.test(utr.trim())) { setUtrError("Enter a valid UTR / transaction reference"); hasErr = true; }
    if (!file) { setFileError("Payment screenshot is required"); hasErr = true; }
    if (hasErr) return;

    setSubmitting(true);
    try {
      const storageRef    = ref(storage, `payment-proofs/${orderId}/${Date.now()}-${file!.name}`);
      const snapshot      = await uploadBytes(storageRef, file!);
      const screenshotUrl = await getDownloadURL(snapshot.ref);
      const now           = new Date().toISOString();

      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: "Under Review",
        paymentProof: {
          utrNumber:    utr.trim().toUpperCase(),
          screenshotUrl,
          notes:        notes.trim() || null,
          submittedAt:  now,
        },
        updatedAt: now,
      });

      setStep("confirmed");
    } catch (err) {
      console.error(err);
      setFileError("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!order && !loadErr) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
    </div>
  );

  if (loadErr) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-gray-700 font-medium">{loadErr}</p>
      <button onClick={() => router.push("/plans")} className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50">Back to Plans</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6B00] rounded-[8px] flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">NIK<span className="text-[#FF6B00]">Panel</span></span>
          </Link>
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF6B00] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Plans
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-10">
        <Steps current={step} />

        <AnimatePresence mode="wait">

          {/* ── Step 1: Pay ── */}
          {step === "payment" && order && (
            <motion.div key="payment" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card overflow-hidden">

                {/* Order ID strip */}
                <div className="bg-orange-50 border-b border-orange-100 px-5 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-gray-900">{order.orderId}</span>
                    <CopyButton text={order.orderId} label="Order ID" />
                  </div>
                </div>

                <div className="p-6">
                  {/* Amount */}
                  <div className="text-center mb-7">
                    <p className="text-sm text-gray-400 mb-1">Pay to {UPI_NAME}</p>
                    <p className="text-5xl font-bold text-gray-900">₹{order.amount.toLocaleString("en-IN")}</p>
                    <p className="text-sm text-gray-400 mt-1">{order.planName} · {order.billingCycle}</p>
                  </div>

                  {/* Primary: Open UPI App button */}
                  <a href={upiUrl}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-base rounded-[14px] transition-colors shadow-lg shadow-orange-200 mb-3">
                    <Smartphone className="w-5 h-5" />
                    Pay ₹{order.amount.toLocaleString("en-IN")} with UPI App
                  </a>

                  {/* App-specific buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {UPI_APPS.map((app) => (
                      <a key={app.name} href={app.scheme(upiUrl)}
                        style={{ backgroundColor: app.color }}
                        className="flex items-center justify-center py-2.5 rounded-[10px] text-white text-xs font-bold hover:opacity-90 transition-opacity">
                        {app.name}
                      </a>
                    ))}
                  </div>

                  {/* How it works */}
                  <div className="bg-blue-50 rounded-[12px] p-4 mb-5">
                    <p className="text-xs font-semibold text-blue-800 mb-2">How to pay:</p>
                    <ol className="space-y-1.5">
                      {[
                        `Tap "Pay with UPI App" above`,
                        "Your UPI app opens automatically (GPay / PhonePe / Paytm)",
                        `Confirm and pay ₹${order.amount.toLocaleString("en-IN")}`,
                        "Save the UTR / Transaction ID shown after payment",
                        'Come back here and tap "I\'ve Paid"',
                      ].map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs text-blue-700">
                          <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* UPI ID */}
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 mb-5">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">UPI ID</p>
                      <p className="font-mono text-sm font-bold text-gray-900">{UPI_ID}</p>
                    </div>
                    <CopyButton text={UPI_ID} label="UPI ID" />
                  </div>

                  {/* QR toggle for desktop */}
                  <button onClick={() => setShowQR((v) => !v)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
                    {showQR ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showQR ? "Hide QR Code" : "Show QR Code (for desktop / camera scan)"}
                  </button>

                  {showQR && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col items-center mb-5">
                      <div className="bg-white border-2 border-gray-100 rounded-[16px] p-3 shadow-sm inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrSrc} alt="UPI QR Code" width={200} height={200} className="rounded-[8px]" />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Scan with any UPI app camera</p>
                    </motion.div>
                  )}

                  <button onClick={() => setStep("proof")}
                    className="w-full py-3.5 border-2 border-[#FF6B00] text-[#FF6B00] font-bold text-sm rounded-[14px] hover:bg-orange-50 transition-colors">
                    I've Paid — Submit Payment Proof →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Proof ── */}
          {step === "proof" && order && (
            <motion.div key="proof" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center justify-between">
                  <button onClick={() => setStep("payment")} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="font-mono text-xs text-gray-400">{order.orderId}</span>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Payment Proof</h2>
                  <p className="text-sm text-gray-400 mb-6">Enter the UTR number from your UPI app and upload a payment screenshot.</p>

                  <form onSubmit={handleSubmitProof} className="space-y-5">
                    <div>
                      <Input
                        label="UTR / Transaction ID"
                        placeholder="e.g. 407520897321 or T24070612345"
                        value={utr}
                        error={utrError}
                        onChange={(e) => { setUtr(e.target.value); setUtrError(""); }}
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Find this in your UPI app under "Transaction History" after payment. Usually 12–22 characters.
                      </p>
                    </div>

                    {/* Screenshot */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Payment Screenshot <span className="text-red-400">*</span>
                      </label>
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                      {preview ? (
                        <div className="relative rounded-[12px] border-2 border-green-200 overflow-hidden bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt="Screenshot preview" className="w-full max-h-60 object-contain" />
                          <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-red-50">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                          <div className="bg-green-50 border-t border-green-200 px-4 py-2 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs text-green-700 font-medium truncate">{file?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className={`w-full rounded-[12px] border-2 border-dashed px-6 py-8 flex flex-col items-center gap-2 transition-colors hover:bg-gray-50 ${fileError ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-[#FF6B00]"}`}>
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                            <ImagePlus className="w-6 h-6 text-[#FF6B00]" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Upload payment screenshot</p>
                          <p className="text-xs text-gray-400">PNG, JPG — max 5 MB</p>
                        </button>
                      )}
                      {fileError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fileError}</p>}
                    </div>

                    <Textarea label="Notes (optional)" placeholder="Payment app used, time of payment, etc." value={notes}
                      onChange={(e) => setNotes(e.target.value)} rows={2} />

                    {/* Order summary */}
                    <div className="bg-gray-50 rounded-[12px] p-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{order.planName}</p>
                        <p className="font-mono text-xs text-gray-400">{order.orderId}</p>
                      </div>
                      <span className="text-xl font-bold text-[#FF6B00]">₹{order.amount.toLocaleString("en-IN")}</span>
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full py-4 bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-[14px] transition-colors flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><FileCheck className="w-4 h-4" /> Submit Payment Proof</>}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Confirmed ── */}
          {step === "confirmed" && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-[#FF6B00]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Proof Submitted!</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  Our team will verify your payment within <strong>30 minutes</strong> and activate your VPS.
                </p>

                <div className="bg-gray-50 rounded-[12px] p-5 text-left space-y-3 max-w-xs mx-auto mb-8">
                  {[
                    { icon: Check,      color: "bg-green-50 text-green-600",  label: "Order placed",         sub: order?.orderId },
                    { icon: Check,      color: "bg-green-50 text-green-600",  label: "Payment proof received", sub: "UTR submitted" },
                    { icon: Clock,      color: "bg-orange-50 text-[#FF6B00]", label: "Awaiting verification", sub: "~30 minutes" },
                    { icon: Server,     color: "bg-gray-100 text-gray-300",   label: "VPS provisioning",      sub: "After approval" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 ${i === 3 ? "opacity-40" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/orders"
                    className="px-6 py-3 bg-[#FF6B00] text-white font-bold rounded-full hover:bg-orange-600 transition-colors text-sm">
                    View My Orders
                  </Link>
                  <Link href="/dashboard"
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-sm">
                    Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function UPICheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    }>
      <UPIContent />
    </Suspense>
  );
}

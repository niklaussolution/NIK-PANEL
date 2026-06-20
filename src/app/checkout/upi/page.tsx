"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Copy, Check, Upload, AlertCircle, ArrowLeft,
  Loader2, ImagePlus, X, FileCheck, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
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
    { id: "payment",   label: "Scan & Pay" },
    { id: "proof",     label: "Submit Proof" },
    { id: "confirmed", label: "Confirmed" },
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

// ── UPI content ───────────────────────────────────────────────────────────────
function UPIContent() {
  const searchParams = useSearchParams();
  const orderId      = searchParams.get("order") || "";
  const router       = useRouter();

  const [order, setOrder]   = useState<UPIOrder | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [step, setStep]     = useState<"payment" | "proof" | "confirmed">("payment");

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
    getDoc(doc(db, "orders", orderId))
      .then((snap) => {
        if (!snap.exists()) { setLoadErr("Order not found."); return; }
        const data = snap.data() as UPIOrder;
        setOrder(data);
        // If already submitted proof or approved, jump to step
        if (data.paymentProof)                     setStep("confirmed");
        else if (data.paymentStatus === "Approved") setStep("confirmed");
      })
      .catch(() => setLoadErr("Failed to load order."));
  }, [orderId]);

  const upiUrl = order
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${order.amount}&tn=${order.orderId}&cu=INR`
    : "";
  const qrSrc = upiUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=000000&margin=4`
    : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setFileError("Only image files are allowed."); return; }
    if (f.size > 5 * 1024 * 1024)    { setFileError("File size must be under 5 MB.");   return; }
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
      // Upload screenshot
      const storageRef = ref(storage, `payment-proofs/${orderId}/${Date.now()}-${file!.name}`);
      const snapshot   = await uploadBytes(storageRef, file!);
      const screenshotUrl = await getDownloadURL(snapshot.ref);

      const now = new Date().toISOString();

      // Update Firestore
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

  // ── Loading / error state ──
  if (!order && !loadErr) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
    </div>
  );

  if (loadErr) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-gray-700 font-medium">{loadErr}</p>
      <Button variant="outline" onClick={() => router.push("/plans")}>Back to Plans</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
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

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <Steps current={step} />

        <AnimatePresence mode="wait">

          {/* ── Step 1: Payment ── */}
          {step === "payment" && order && (
            <motion.div key="payment" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card overflow-hidden">
                {/* Order badge */}
                <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Order ID</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                    <CopyButton text={order.orderId} label="Order ID" />
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Complete your UPI payment</h1>
                  <p className="text-sm text-gray-400 mb-6">Scan the QR code below with any UPI app or use our UPI ID to pay.</p>

                  {/* QR + details */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
                    {/* QR Code */}
                    <div className="shrink-0 bg-white border-2 border-gray-100 rounded-[16px] p-3 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrSrc} alt="UPI QR Code" width={200} height={200} className="rounded-[8px]" />
                      <p className="text-center text-xs text-gray-400 mt-2">Scan with any UPI app</p>
                    </div>

                    {/* Payment info */}
                    <div className="flex-1 space-y-4 w-full">
                      {/* Amount */}
                      <div className="bg-orange-50 rounded-[12px] p-4 text-center sm:text-left">
                        <p className="text-xs text-gray-500 mb-1">Amount to Pay</p>
                        <p className="text-3xl font-bold text-[#FF6B00]">₹{order.amount.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.planName} — {order.billingCycle}</p>
                      </div>

                      {/* UPI ID */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">UPI ID</p>
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-gray-900">{UPI_ID}</span>
                          <CopyButton text={UPI_ID} label="UPI ID" />
                        </div>
                      </div>

                      {/* UPI Name */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Pay To</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">{UPI_NAME}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="bg-blue-50 rounded-[12px] p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-800 mb-3">How to pay:</p>
                    <ol className="space-y-2">
                      {[
                        "Open any UPI app (GPay, PhonePe, Paytm, etc.)",
                        `Scan the QR code or search for UPI ID: ${UPI_ID}`,
                        `Enter the exact amount: ₹${order.amount.toLocaleString("en-IN")}`,
                        "Complete the payment and save the UTR / transaction number",
                        'Click "I\'ve Paid" below and submit your payment proof',
                      ].map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                          <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Important note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-[12px] p-3 flex gap-2.5 mb-6">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      Always enter the <strong>exact amount</strong> shown. Orders with mismatched amounts may face delayed verification.
                      Note your <strong>UTR/Transaction ID</strong> — you will need it in the next step.
                    </p>
                  </div>

                  <Button size="lg" className="w-full" onClick={() => setStep("proof")}>
                    I've Paid — Submit Payment Proof
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Proof submission ── */}
          {step === "proof" && order && (
            <motion.div key="proof" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
                  <button onClick={() => setStep("payment")} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to QR
                  </button>
                  <span className="font-mono text-xs text-gray-500">{order.orderId}</span>
                </div>

                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Payment Proof</h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Enter your UTR number and upload a screenshot of the successful payment. We verify within 30 minutes.
                  </p>

                  <form onSubmit={handleSubmitProof} className="space-y-5">
                    {/* UTR */}
                    <div>
                      <Input
                        label="UTR / Transaction Reference Number"
                        placeholder="e.g. 123456789012 or T2407061234567890"
                        value={utr}
                        error={utrError}
                        onChange={(e) => { setUtr(e.target.value); setUtrError(""); }}
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Find UTR in your UPI app under transaction history. It is usually 12–22 alphanumeric characters.
                      </p>
                    </div>

                    {/* Screenshot upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Screenshot <span className="text-red-400">*</span></label>
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                      {preview ? (
                        <div className="relative rounded-[12px] border-2 border-green-200 overflow-hidden bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt="Screenshot preview" className="w-full max-h-64 object-contain" />
                          <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-red-50 transition-colors">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                          <div className="bg-green-50 border-t border-green-200 px-4 py-2 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">{file?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className={`w-full rounded-[12px] border-2 border-dashed px-6 py-8 flex flex-col items-center gap-2 transition-colors duration-200 hover:bg-gray-50 ${fileError ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-[#FF6B00]"}`}>
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                            <ImagePlus className="w-6 h-6 text-[#FF6B00]" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-700">Click to upload screenshot</p>
                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP — max 5 MB</p>
                          </div>
                        </button>
                      )}
                      {fileError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{fileError}</p>}
                    </div>

                    {/* Notes */}
                    <Textarea
                      label="Additional Notes (optional)"
                      placeholder="Any additional info — payment app used, time of payment, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />

                    {/* Order summary */}
                    <div className="bg-gray-50 rounded-[12px] p-4 text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-mono font-semibold text-gray-900">{order.orderId}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-semibold text-gray-900">{order.planName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-[#FF6B00]">₹{order.amount.toLocaleString("en-IN")}</span></div>
                    </div>

                    <Button type="submit" size="lg" loading={submitting} className="w-full">
                      {submitting ? "Uploading…" : "Submit Payment Proof"}
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Confirmed ── */}
          {step === "confirmed" && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-card p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-[#FF6B00]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Proof Submitted!</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Your payment proof has been received. Our team will verify it within <strong>30 minutes</strong> during business hours and activate your VPS.
                </p>

                <div className="bg-gray-50 rounded-[12px] p-5 text-left space-y-3 max-w-sm mx-auto mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Order placed</p>
                      <p className="text-xs text-gray-400">{order?.orderId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Payment proof received</p>
                      <p className="text-xs text-gray-400">UTR submitted successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Awaiting verification</p>
                      <p className="text-xs text-gray-400">Usually within 30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 opacity-40">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">VPS provisioning</p>
                      <p className="text-xs text-gray-400">After approval</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/orders">
                    <Button size="lg">View My Orders</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">Go to Dashboard</Button>
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

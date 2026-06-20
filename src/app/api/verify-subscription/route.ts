export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      userId,
      planId,
      planName,
      amount,
      hostname,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    // Verify Razorpay signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    // Update subscription to active
    await db.collection("subscriptions").doc(razorpay_subscription_id).set(
      {
        status: "active",
        razorpayPaymentId: razorpay_payment_id,
        activatedAt: now,
        nextBillingAt: nextBilling.toISOString(),
        updatedAt: now,
      },
      { merge: true }
    );

    // Create order record (first payment)
    const orderRef = db.collection("orders").doc();
    await orderRef.set({
      id: orderRef.id,
      userId,
      planId,
      planName,
      amount,
      hostname,
      customerName,
      customerEmail,
      customerPhone,
      status: "paid",
      type: "subscription",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      createdAt: now,
    });

    // Create VPS record
    const vpsRef = db.collection("vps").doc();
    await vpsRef.set({
      id: vpsRef.id,
      userId,
      planId,
      planName,
      hostname,
      ipAddress: generateMockIP(),
      status: "provisioning",
      cpu: getCpuForPlan(planId),
      ram: getRamForPlan(planId),
      storage: getStorageForPlan(planId),
      os: "AlmaLinux 9",
      subscriptionId: razorpay_subscription_id,
      createdAt: now,
    });

    // Save payment record
    const payRef = db.collection("payments").doc();
    await payRef.set({
      id: payRef.id,
      orderId: orderRef.id,
      userId,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpaySignature: razorpay_signature,
      amount,
      status: "success",
      type: "subscription_first_payment",
      createdAt: now,
    });

    return NextResponse.json({ success: true, message: "Subscription activated" });
  } catch (err) {
    console.error("Verify subscription error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// Helpers
function generateMockIP() {
  return `103.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}
function getCpuForPlan(id: string) {
  return { starter: "2 vCPU", business: "4 vCPU", professional: "6 vCPU", enterprise: "8 vCPU" }[id] ?? "2 vCPU";
}
function getRamForPlan(id: string) {
  return { starter: "2 GB RAM", business: "4 GB RAM", professional: "8 GB RAM", enterprise: "16 GB RAM" }[id] ?? "2 GB RAM";
}
function getStorageForPlan(id: string) {
  return { starter: "40 GB NVMe SSD", business: "80 GB NVMe SSD", professional: "160 GB NVMe SSD", enterprise: "320 GB NVMe SSD" }[id] ?? "40 GB NVMe SSD";
}

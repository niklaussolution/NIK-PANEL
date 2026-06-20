export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      userId,
      planId,
      planName,
      amount,
      hostname,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const db = getAdminDb();
    const batch = db.batch();

    // Update matching order document
    const ordersQuery = await db
      .collection("orders")
      .where("razorpayOrderId", "==", orderId)
      .limit(1)
      .get();

    if (!ordersQuery.empty) {
      batch.update(ordersQuery.docs[0].ref, {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: new Date().toISOString(),
      });
    }

    // Save payment record
    const paymentRef = db.collection("payments").doc();
    batch.set(paymentRef, {
      id: paymentRef.id,
      orderId,
      userId,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      amount,
      status: "success",
      createdAt: new Date().toISOString(),
    });

    // Create VPS record
    const vpsRef = db.collection("vps").doc();
    const oct2 = Math.floor(Math.random() * 254) + 1;
    const oct3 = Math.floor(Math.random() * 254) + 1;
    const oct4 = Math.floor(Math.random() * 254) + 1;
    const ipAddress = `103.${oct2}.${oct3}.${oct4}`;

    const planSpecs: Record<string, { cpu: string; ram: string; storage: string }> = {
      starter:      { cpu: "2 vCPU", ram: "2 GB",  storage: "40 GB NVMe SSD"  },
      business:     { cpu: "4 vCPU", ram: "4 GB",  storage: "80 GB NVMe SSD"  },
      professional: { cpu: "6 vCPU", ram: "8 GB",  storage: "160 GB NVMe SSD" },
      enterprise:   { cpu: "8 vCPU", ram: "16 GB", storage: "320 GB NVMe SSD" },
    };

    batch.set(vpsRef, {
      id: vpsRef.id,
      userId,
      planId,
      planName,
      hostname,
      ipAddress,
      status: "active",
      ...(planSpecs[planId] ?? planSpecs.starter),
      os: "AlmaLinux 9",
      createdAt: new Date().toISOString(),
    });

    // Update user record
    const userRef = db.collection("users").doc(userId);
    batch.update(userRef, { phone: customerPhone, name: customerName });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}

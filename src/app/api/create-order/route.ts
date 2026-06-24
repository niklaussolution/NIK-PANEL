export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      planId, planName, amount, userId,
      customerName, customerEmail, customerPhone,
      os,
      couponCode, couponDiscount,
    } = body;

    if (!planId || !amount || !userId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount < 1) {
      return NextResponse.json({ error: "Amount must be at least ₹1" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { planId, userId, os: os || "" },
    });

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc();
    await orderRef.set({
      id: orderRef.id,
      userId,
      planId,
      planName: planName || planId,
      amount,
      os: os || "",
      status: "pending",
      type: "one_time",
      razorpayOrderId: razorpayOrder.id,
      customerName,
      customerEmail,
      customerPhone,
      ...(couponCode     ? { couponCode }     : {}),
      ...(couponDiscount ? { couponDiscount } : {}),
      createdAt: new Date().toISOString(),
    });

    // Notify admin — new purchase attempt
    const notifRef = db.collection("notifications").doc();
    await notifRef.set({
      id:            notifRef.id,
      type:          "new_order",
      userId,
      customerName,
      customerEmail,
      customerPhone,
      planName:      planName || planId,
      amount,
      orderId:       orderRef.id,
      razorpayOrderId: razorpayOrder.id,
      read:          false,
      createdAt:     new Date().toISOString(),
    });

    return NextResponse.json({
      orderId:  razorpayOrder.id,
      amount:   razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order", detail: message }, { status: 500 });
  }
}

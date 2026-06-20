export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, amount, userId, customerName, customerEmail, customerPhone, hostname } = body;

    if (!planId || !amount || !userId || !customerName || !customerEmail || !customerPhone || !hostname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9-]+$/.test(hostname)) {
      return NextResponse.json({ error: "Invalid hostname" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: { planId, userId, hostname },
    });

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc();
    await orderRef.set({
      id: orderRef.id,
      userId,
      planId,
      amount,
      status: "pending",
      razorpayOrderId: razorpayOrder.id,
      hostname,
      customerName,
      customerEmail,
      customerPhone,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId: razorpayOrder.id, amount: razorpayOrder.amount });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

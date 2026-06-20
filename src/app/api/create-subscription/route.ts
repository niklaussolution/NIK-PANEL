export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebaseAdmin";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      planId, planName, amount,
      userId, customerName, customerEmail, customerPhone,
      os,
      couponCode, couponDiscount,
    } = body;

    if (!planId || !amount || !userId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1 — Create (or reuse) a Razorpay Plan for this amount
    const rzpPlanId = await getOrCreateRazorpayPlan(planId, planName, amount);

    // Step 2 — Create Razorpay Subscription (monthly, unlimited cycles)
    const subscription = await (razorpay.subscriptions as any).create({
      plan_id: rzpPlanId,
      total_count: 120,       // max 10 years of monthly cycles
      quantity: 1,
      customer_notify: 1,
      notes: { planId, userId, os: os || "", customerName, customerEmail },
    });

    // Step 3 — Save pending subscription to Firestore
    const db = getAdminDb();
    await db.collection("subscriptions").doc(subscription.id).set({
      id: subscription.id,
      userId,
      planId,
      planName,
      amount,
      os: os || "",
      customerName,
      customerEmail,
      customerPhone,
      ...(couponCode    ? { couponCode }    : {}),
      ...(couponDiscount ? { couponDiscount } : {}),
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: rzpPlanId,
      status: "created",
      nextBillingAt: null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      amount: amount * 100,
    });
  } catch (err) {
    console.error("Create subscription error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

async function getOrCreateRazorpayPlan(planId: string, planName: string, amount: number): Promise<string> {
  const db = getAdminDb();
  const cachedDoc = await db.collection("razorpay_plans").doc(planId).get();

  // Return cached plan if amount matches
  if (cachedDoc.exists) {
    const cached = cachedDoc.data()!;
    if (cached.amount === amount) return cached.rzpPlanId as string;
  }

  // Create a new Razorpay Plan
  const rzpPlan = await (razorpay.plans as any).create({
    period: "monthly",
    interval: 1,
    item: {
      name: planName || `VPS Plan ${planId}`,
      amount: amount * 100,   // Razorpay expects paise
      currency: "INR",
      description: `NIKPanel — ${planName} (monthly)`,
    },
    notes: { planId },
  });

  // Cache it so we reuse the same Razorpay plan next time
  await db.collection("razorpay_plans").doc(planId).set({
    planId,
    rzpPlanId: rzpPlan.id,
    amount,
    updatedAt: new Date().toISOString(),
  });

  return rzpPlan.id as string;
}

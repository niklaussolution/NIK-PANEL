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
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getAdminDb();

    // Verify this subscription belongs to the user
    const subDoc = await db.collection("subscriptions").doc(subscriptionId).get();
    if (!subDoc.exists || subDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cancel at end of current billing cycle (cancel_at_cycle_end = 1)
    await (razorpay.subscriptions as any).cancel(subscriptionId, { cancel_at_cycle_end: 1 });

    await db.collection("subscriptions").doc(subscriptionId).set(
      { status: "cancel_requested", cancelRequestedAt: new Date().toISOString() },
      { merge: true }
    );

    return NextResponse.json({ success: true, message: "Subscription will cancel at end of billing cycle." });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}

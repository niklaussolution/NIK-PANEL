export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Razorpay sends webhook events for every recurring charge
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Verify webhook authenticity
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const db = getAdminDb();
    const now = new Date().toISOString();

    switch (event.event) {

      // Monthly auto-charge succeeded
      case "subscription.charged": {
        const sub = event.payload.subscription.entity;
        const payment = event.payload.payment.entity;
        const nextBilling = new Date((sub.current_end + 1) * 1000).toISOString();

        await db.collection("subscriptions").doc(sub.id).set(
          { status: "active", nextBillingAt: nextBilling, updatedAt: now },
          { merge: true }
        );

        // Record recurring payment as new order
        const subDoc = await db.collection("subscriptions").doc(sub.id).get();
        if (subDoc.exists) {
          const subData = subDoc.data()!;
          const orderRef = db.collection("orders").doc();
          await orderRef.set({
            id: orderRef.id,
            userId: subData.userId,
            planId: subData.planId,
            planName: subData.planName,
            amount: payment.amount / 100,
            hostname: subData.hostname,
            customerName: subData.customerName,
            customerEmail: subData.customerEmail,
            customerPhone: subData.customerPhone,
            status: "paid",
            type: "subscription_renewal",
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: sub.id,
            createdAt: now,
          });

          const payRef = db.collection("payments").doc();
          await payRef.set({
            id: payRef.id,
            userId: subData.userId,
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: sub.id,
            amount: payment.amount / 100,
            status: "success",
            type: "subscription_renewal",
            createdAt: now,
          });
        }
        break;
      }

      // Payment failed — mark subscription as past_due
      case "subscription.payment.failed": {
        const sub = event.payload.subscription.entity;
        await db.collection("subscriptions").doc(sub.id).set(
          { status: "past_due", updatedAt: now },
          { merge: true }
        );
        // Suspend linked VPS
        const vpsSnap = await db.collection("vps")
          .where("subscriptionId", "==", sub.id).get();
        for (const vpsDoc of vpsSnap.docs) {
          await vpsDoc.ref.update({ status: "suspended" });
        }
        break;
      }

      // Subscription cancelled
      case "subscription.cancelled": {
        const sub = event.payload.subscription.entity;
        await db.collection("subscriptions").doc(sub.id).set(
          { status: "cancelled", cancelledAt: now, updatedAt: now },
          { merge: true }
        );
        const vpsSnap = await db.collection("vps")
          .where("subscriptionId", "==", sub.id).get();
        for (const vpsDoc of vpsSnap.docs) {
          await vpsDoc.ref.update({ status: "stopped" });
        }
        break;
      }

      // Subscription completed (all cycles done)
      case "subscription.completed": {
        const sub = event.payload.subscription.entity;
        await db.collection("subscriptions").doc(sub.id).set(
          { status: "completed", updatedAt: now },
          { merge: true }
        );
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

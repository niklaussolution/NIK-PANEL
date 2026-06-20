export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

const COLLECTIONS = ["orders", "payments", "vps", "subscriptions", "razorpay_plans"];

async function deleteCollection(db: FirebaseFirestore.Firestore, name: string) {
  const snap = await db.collection(name).get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export async function POST() {
  try {
    const db = getAdminDb();
    const results: Record<string, number> = {};
    for (const col of COLLECTIONS) {
      results[col] = await deleteCollection(db, col);
    }
    return NextResponse.json({ success: true, deleted: results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Clear data error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

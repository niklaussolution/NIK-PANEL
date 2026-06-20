import { db } from "./firebase";
import { doc, runTransaction, setDoc, collection, addDoc } from "firebase/firestore";
import { UPIOrder, UPITransaction, AppNotification } from "@/types";

// ── Order ID generation ───────────────────────────────────────────────────────
// Format: NIK-YYYYMMDD-XXXX  (e.g. NIK-20260620-0003)
export async function generateOrderId(): Promise<string> {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  const counterRef = doc(db, "_counters", `orders_${dateStr}`);

  const counter = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data().value as number) : 0;
    const next = current + 1;
    tx.set(counterRef, { value: next, date: dateStr });
    return next;
  });

  return `NIK-${dateStr}-${String(counter).padStart(4, "0")}`;
}

// ── Create a UPI order document ───────────────────────────────────────────────
export async function createUPIOrder(order: UPIOrder): Promise<void> {
  await setDoc(doc(db, "orders", order.orderId), order);
}

// ── Create a transaction record after approval ────────────────────────────────
export async function createTransaction(tx: Omit<UPITransaction, "id">): Promise<void> {
  await addDoc(collection(db, "transactions"), tx);
}

// ── Create a user notification ────────────────────────────────────────────────
export async function createNotification(
  notif: Omit<AppNotification, "id">
): Promise<void> {
  await addDoc(collection(db, "notifications"), notif);
}

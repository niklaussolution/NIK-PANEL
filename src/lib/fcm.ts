import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestPushPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (!VAPID_KEY) { console.warn("VAPID key not set"); return null; }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (err) {
    console.error("FCM getToken error:", err);
    return null;
  }
}

export function onForegroundMessage(cb: (payload: { notification?: { title?: string; body?: string } }) => void) {
  if (typeof window === "undefined") return () => {};
  const messaging = getMessaging(app);
  return onMessage(messaging, cb as Parameters<typeof onMessage>[1]);
}

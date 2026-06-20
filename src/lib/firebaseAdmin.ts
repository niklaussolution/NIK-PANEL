import * as admin from "firebase-admin";

function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are not configured.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

// Legacy named exports — call getAdminApp lazily so the module can be imported
// at build time without crashing when env vars are missing/placeholder.
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    return getAdminDb()[prop as keyof admin.firestore.Firestore];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    return getAdminAuth()[prop as keyof admin.auth.Auth];
  },
});

export default admin;

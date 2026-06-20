"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) return userDoc.data() as User;
    return null;
  } catch (err: unknown) {
    // Firestore offline or rules blocking — fail silently, don't crash the app
    const code = (err as { code?: string })?.code;
    if (code === "unavailable" || code === "failed-precondition") {
      console.warn("Firestore offline — user data not loaded yet.");
    }
    return null;
  }
}

async function createUserDoc(uid: string, name: string, email: string): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), {
      id: uid,
      name,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    console.error("Could not create user document:", code);
    throw err;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await createUserDoc(user.uid, name, email);
  };

  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const existing = await fetchUserData(user.uid);
      if (!existing) {
        await createUserDoc(
          user.uid,
          user.displayName || "User",
          user.email || ""
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user") {
        // User dismissed the popup — not an error worth showing
        return;
      }
      if (code === "auth/popup-blocked") {
        toast.error("Popup was blocked by your browser. Please allow popups for this site.");
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userData, loading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";

export type UserProfile = {
  displayName: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  plan?: "free" | "premium";
  premiumUntil?: string; // ISO date string
  createdAt?: string;
};

type AuthCtx = {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isPremium: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  userProfile: null,
  isAdmin: false,
  isPremium: false,
  loading: true,
  logout: async () => {},
});

function computeIsPremium(profile: UserProfile | null): boolean {
  if (!profile || profile.plan !== "premium") return false;
  if (!profile.premiumUntil) return true; // no expiry set = lifetime/manual
  return new Date(profile.premiumUntil).getTime() > Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin: userProfile?.role === "admin",
        isPremium: computeIsPremium(userProfile),
        loading,
        logout: () => signOut(auth),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

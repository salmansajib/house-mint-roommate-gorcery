"use client";

import * as React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { User } from "@/types";
import { INITIAL_USERS } from "@/lib/mock-data";
import { createProfileInDb } from "@/lib/supabase/db";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    householdCode: string,
    role?: "admin" | "member",
    isRoommate?: boolean
  ) => Promise<{ error?: string; needsEmailVerification?: boolean }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateUserPassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  quickSignIn: (userId: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "housemint_auth_user_id_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize auth state
  React.useEffect(() => {
    async function initAuth() {
      try {
        const supabase = createClient();

        // 1. Check active Supabase Auth session if configured
        if (supabase && isSupabaseConfigured()) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Find or build user profile, fetching authoritative role from profiles table
            const authEmail = session.user.email;
            let authName =
              session.user.user_metadata?.name ||
              authEmail?.split("@")[0] ||
              "Roommate";
            let authRole: "admin" | "member" =
              (session.user.user_metadata?.role as "admin" | "member") || "member";
            let isRoommate = session.user.user_metadata?.is_roommate !== false;

            try {
              const { data: dbProfile } = await supabase
                .from("profiles")
                .select("name, role, is_roommate, accent_color")
                .eq("id", session.user.id)
                .maybeSingle();

              if (dbProfile) {
                if (dbProfile.name) authName = dbProfile.name;
                if (dbProfile.role) authRole = dbProfile.role as "admin" | "member";
                if (dbProfile.is_roommate !== undefined) isRoommate = dbProfile.is_roommate;
              }
            } catch (profileErr) {
              console.warn("Could not fetch DB profile during initAuth:", profileErr);
            }

            setCurrentUser({
              id: session.user.id,
              name: authName,
              email: authEmail,
              accent_color: "user-1",
              role: authRole,
              is_roommate: isRoommate,
            });
            setIsLoading(false);
            return;
          }
        }

        // 2. If Supabase is configured and no session exists:
        if (isSupabaseConfigured()) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // 3. Purely offline fallback
        setCurrentUser(INITIAL_USERS[0]);
      } catch (err) {
        console.error("Auth init exception:", err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Supabase auth state change listener
    const supabase = createClient();
    if (supabase && isSupabaseConfigured()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          const email = session.user.email;
          let authName =
            session.user.user_metadata?.name ||
            email?.split("@")[0] ||
            "Roommate";
          let authRole: "admin" | "member" =
            (session.user.user_metadata?.role as "admin" | "member") || "member";
          let isRoommate = session.user.user_metadata?.is_roommate !== false;

          try {
            const { data: dbProfile } = await supabase
              .from("profiles")
              .select("name, role, is_roommate, accent_color")
              .eq("id", session.user.id)
              .maybeSingle();

            if (dbProfile) {
              if (dbProfile.name) authName = dbProfile.name;
              if (dbProfile.role) authRole = dbProfile.role as "admin" | "member";
              if (dbProfile.is_roommate !== undefined) isRoommate = dbProfile.is_roommate;
            }
          } catch (err) {
            console.warn("Error fetching profile on auth change:", err);
          }

          setCurrentUser({
            id: session.user.id,
            name: authName,
            email,
            accent_color: "user-1",
            role: authRole,
            is_roommate: isRoommate,
          });
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const quickSignIn = React.useCallback((userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    }
  }, []);

  const signInWithEmail = React.useCallback(
    async (email: string, pass: string) => {
      const supabase = createClient();
      if (!supabase || !isSupabaseConfigured()) {
        // Mock sign in fallback
        const matched = INITIAL_USERS.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (matched) {
          quickSignIn(matched.id);
          return {};
        }
        return { error: "User not found. Try quick sign-in." };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) return { error: error.message };

        if (data.user) {
          const authName =
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Roommate";
          const userObj: User = {
            id: data.user.id,
            name: authName,
            email: data.user.email,
            accent_color: "user-1",
            role: (data.user.user_metadata?.role as "admin" | "member") || "member",
            is_roommate: data.user.user_metadata?.is_roommate !== false,
          };
          setCurrentUser(userObj);
          localStorage.setItem(AUTH_STORAGE_KEY, userObj.id);
        }
        return {};
      } catch (err: any) {
        return { error: err.message || "Failed to sign in" };
      }
    },
    [quickSignIn]
  );

  const signUpWithEmail = React.useCallback(
    async (
      email: string,
      pass: string,
      name: string,
      householdCode: string,
      role?: "admin" | "member",
      isRoommate: boolean = true
    ) => {
      const supabase = createClient();
      const assignedRole = role || "member";

      if (!supabase || !isSupabaseConfigured()) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          accent_color: "user-2",
          role: assignedRole,
          is_roommate: isRoommate,
        };
        setCurrentUser(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
        return {};
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              name,
              household_code: householdCode,
              household_id: householdCode,
              role: assignedRole,
              is_roommate: isRoommate,
            },
          },
        });

        if (error) return { error: error.message };

        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            name,
            email,
            accent_color: "user-1",
            role: assignedRole,
            is_roommate: isRoommate,
          };
          await createProfileInDb(newUser, householdCode);

          // If session exists, user is auto-confirmed / signed in immediately
          if (data.session) {
            setCurrentUser(newUser);
            localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
            return { needsEmailVerification: false };
          } else {
            // Supabase requires email verification link to be clicked
            return { needsEmailVerification: true };
          }
        }
        return {};
      } catch (err: any) {
        return { error: err.message || "Failed to sign up" };
      }
    },
    []
  );

  const sendPasswordResetEmail = React.useCallback(
    async (email: string) => {
      const supabase = createClient();
      if (!supabase || !isSupabaseConfigured()) {
        return {
          error:
            "Supabase cloud is not configured. In local demo mode, password reset is simulated.",
        };
      }

      try {
        const redirectTo = `${window.location.origin}/login?mode=reset`;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
        if (error) return { error: error.message };
        return { success: true };
      } catch (err: any) {
        return { error: err.message || "Failed to send reset email" };
      }
    },
    []
  );

  const updateUserPassword = React.useCallback(
    async (newPassword: string) => {
      const supabase = createClient();
      if (!supabase || !isSupabaseConfigured()) {
        return { error: "Supabase cloud is not configured." };
      }

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) return { error: error.message };
        return { success: true };
      } catch (err: any) {
        return { error: err.message || "Failed to update password" };
      }
    },
    []
  );

  const signOut = React.useCallback(async () => {
    const supabase = createClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Sign out error:", e);
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // ignore
        }
      }
    }
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        if (name.startsWith("sb-") && name.includes("-auth-token")) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
        }
      });
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("housemint_current_user_v1");
    setCurrentUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordResetEmail,
      updateUserPassword,
      quickSignIn,
      signOut,
    }),
    [
      currentUser,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordResetEmail,
      updateUserPassword,
      quickSignIn,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

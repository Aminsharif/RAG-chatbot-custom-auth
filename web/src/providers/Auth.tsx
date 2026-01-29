// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { SupabaseAuthProvider } from "@/lib/auth/supabase-utils";
// import {
//   AuthProvider as CustomAuthProvider,
//   Session,
//   User,
//   AuthCredentials,
//   AuthError,
// } from "@/lib/auth/types";
// import { getClientSessionSnapshot } from "@/lib/auth/authService";

// interface AuthContextProps {
//   session: Session | null;
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   signIn: (credentials: AuthCredentials) => Promise<{
//     user: User | null;
//     session: Session | null;
//     error: AuthError | null;
//   }>;
//   signUp: (credentials: AuthCredentials) => Promise<{
//     user: User | null;
//     session: Session | null;
//     error: AuthError | null;
//   }>;
//   signInWithGoogle: () => Promise<{
//     user: User | null;
//     session: Session | null;
//     error: AuthError | null;
//   }>;
//   signOut: () => Promise<{ error: AuthError | null }>;
//   resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
//   updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
//   updateUser: (attributes: Partial<User>) => Promise<{
//     user: User | null;
//     error: AuthError | null;
//   }>;
// }

// // Create default authentication provider (Supabase in this case)
// const authProvider = new SupabaseAuthProvider({
//   redirectUrl:
//     typeof window !== "undefined" ? window.location.origin : undefined,
// });

// // Create auth context
// const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// export function AuthProvider({
//   children,
//   customAuthProvider,
//   initialSession = null,
// }: {
//   children: React.ReactNode;
//   customAuthProvider?: CustomAuthProvider;
//   initialSession?: Session | null;
// }) {
//   // Use the provided auth provider or default to Supabase
//   const provider = customAuthProvider || authProvider;

//   const initialSnapshot = getClientSessionSnapshot() || initialSession;

//   const [session, setSession] = useState<Session | null>(initialSnapshot);
//   const [user, setUser] = useState<User | null>(initialSnapshot?.user ?? null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load initial session on mount
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         // Get the current session
//         const currentSession = await provider.getSession();
//         setSession(currentSession);
//         console.log("[AuthProvider] currentSession", currentSession);

//         // If we have a session, get the user
//         if (currentSession?.user) {
//           setUser(currentSession.user);
//         }
//       } catch (error) {
//         console.error("Error initializing auth:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeAuth();
//   }, [provider]);

//   // Set up auth state change listener
//   useEffect(() => {
//     const { unsubscribe } = provider.onAuthStateChange(
//       (newSession: Session | null) => {
//         setSession(newSession);
//         setUser(newSession?.user || null);
//       },
//     );

//     return () => {
//       unsubscribe();
//     };
//   }, [provider]);
  
//   const value = {
//     session,
//     user,
//     isLoading,
//     isAuthenticated: !!session?.accessToken,
//     signIn: provider.signIn.bind(provider),
//     signUp: provider.signUp.bind(provider),
//     signInWithGoogle: provider.signInWithGoogle.bind(provider),
//     signOut: provider.signOut.bind(provider),
//     resetPassword: provider.resetPassword.bind(provider),
//     updatePassword: provider.updatePassword.bind(provider),
//     updateUser: provider.updateUser.bind(provider),
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuthContext() {
//   const context = useContext(AuthContext);

//   if (context === undefined) {
//     throw new Error("useAuthContext must be used within an AuthProvider");
//   }

//   return context;
// }

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SupabaseAuthProvider } from "@/lib/auth/supabase-utils";
import {
  AuthProvider as CustomAuthProvider,
  Session,
  User,
  AuthCredentials,
  AuthError,
} from "@/lib/auth/types";
import { getClientSessionSnapshot } from "@/lib/auth/authService";

// Define storage key for auth synchronization
const AUTH_STORAGE_KEY = "auth-session";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }>;
  signUp: (credentials: AuthCredentials) => Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }>;
  signInWithGoogle: () => Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateUser: (attributes: Partial<User>) => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
}

// Create default authentication provider (Supabase in this case)
const authProvider = new SupabaseAuthProvider({
  redirectUrl:
    typeof window !== "undefined" ? window.location.origin : undefined,
});

// Create auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper function to store session in localStorage
const storeSessionInStorage = (session: Session | null) => {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error storing session in localStorage:", error);
  }
};

// Helper function to retrieve session from localStorage
const getSessionFromStorage = (): Session | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error retrieving session from localStorage:", error);
    return null;
  }
};

export function AuthProvider({
  children,
  customAuthProvider,
  initialSession = null,
}: {
  children: React.ReactNode;
  customAuthProvider?: CustomAuthProvider;
  initialSession?: Session | null;
}) {
  // Use the provided auth provider or default to Supabase
  const provider = customAuthProvider || authProvider;

  const initialSnapshot = getClientSessionSnapshot() || initialSession;

  const [session, setSession] = useState<Session | null>(initialSnapshot);
  const [user, setUser] = useState<User | null>(initialSnapshot?.user ?? null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage first for quick hydration
        const storedSession = getSessionFromStorage();
        if (storedSession) {
          setSession(storedSession);
          setUser(storedSession.user);
        }

        // Get the current session from auth provider
        const currentSession = await provider.getSession();
        
        // If there's a mismatch between localStorage and provider, use provider
        if (currentSession && (!storedSession || 
            storedSession.accessToken !== currentSession.accessToken)) {
          setSession(currentSession);
          setUser(currentSession.user);
          storeSessionInStorage(currentSession);
        } else if (!currentSession && storedSession) {
          // If provider has no session but localStorage does, clear localStorage
          storeSessionInStorage(null);
        }
        
        console.log("[AuthProvider] currentSession", currentSession);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [provider]);

  // Set up auth state change listener
  useEffect(() => {
    const { unsubscribe } = provider.onAuthStateChange(
      (newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        storeSessionInStorage(newSession);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [provider]);

  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return;
      
      const newSession = getSessionFromStorage();
      
      if (!newSession) {
        // Session was removed (logout from another tab)
        setSession(null);
        setUser(null);
        
        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      } else {
        // Session was added or updated
        const currentToken = session?.accessToken;
        const newToken = newSession.accessToken;
        
        // Only update if tokens are different
        if (currentToken !== newToken) {
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    };

    // Handle unauthorized events from other tabs
    const handleUnauthorized = () => {
      setSession(null);
      setUser(null);
      storeSessionInStorage(null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [session?.accessToken]);

  // Wrap provider methods to update localStorage
  const wrappedSignIn = useCallback(async (credentials: AuthCredentials) => {
    const result = await provider.signIn(credentials);
    if (result.session) {
      storeSessionInStorage(result.session);
    }
    return result;
  }, [provider]);

  const wrappedSignUp = useCallback(async (credentials: AuthCredentials) => {
    const result = await provider.signUp(credentials);
    if (result.session) {
      storeSessionInStorage(result.session);
    }
    return result;
  }, [provider]);

  const wrappedSignInWithGoogle = useCallback(async () => {
    const result = await provider.signInWithGoogle();
    if (result.session) {
      storeSessionInStorage(result.session);
    }
    return result;
  }, [provider]);

  const wrappedSignOut = useCallback(async () => {
    const result = await provider.signOut();
    // Clear localStorage on sign out
    storeSessionInStorage(null);
    // Dispatch unauthorized event for other tabs
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return result;
  }, [provider]);

  const wrappedUpdatePassword = useCallback(async (newPassword: string) => {
    return provider.updatePassword(newPassword);
  }, [provider]);

  const wrappedUpdateUser = useCallback(async (attributes: Partial<User>) => {
    const result = await provider.updateUser(attributes);
    if (result.user && session) {
      // Update session in localStorage if user was updated
      const updatedSession = { ...session, user: result.user };
      storeSessionInStorage(updatedSession);
    }
    return result;
  }, [provider, session]);

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!session?.accessToken,
    signIn: wrappedSignIn,
    signUp: wrappedSignUp,
    signInWithGoogle: wrappedSignInWithGoogle,
    signOut: wrappedSignOut,
    resetPassword: provider.resetPassword.bind(provider),
    updatePassword: wrappedUpdatePassword,
    updateUser: wrappedUpdateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

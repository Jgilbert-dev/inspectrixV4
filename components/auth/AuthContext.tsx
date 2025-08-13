import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import {
  AuthState,
  UserProfile,
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from "../../types/auth";

interface AuthContextType extends AuthState {
  signIn: (
    credentials: LoginCredentials
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    credentials: RegisterCredentials
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  // Get user profile from database
  const getUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Create user profile after registration
  const createUserProfile = async (
    user: User,
    additionalData: Partial<UserProfile> = {}
  ): Promise<void> => {
    try {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: additionalData.full_name || null,
        company: additionalData.company || null,
        role: additionalData.role || null,
      });

      if (error) {
        console.error("Error creating user profile:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };

  // Handle auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthStateChange = async (session: Session | null) => {
    if (session?.user) {
      // User is signed in
      const profile = await getUserProfile(session.user.id);
      setState({
        user: session.user,
        profile,
        loading: false,
        initialized: true,
      });
    } else {
      // User is signed out
      setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    }
  };

  const signIn = async (
    credentials: LoginCredentials
  ): Promise<{ error: AuthError | null }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        setState((prev) => ({ ...prev, loading: false }));
        return { error: { message: error.message, code: error.message } };
      }

      return { error: null };
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      return {
        error: { message: "An unexpected error occurred during sign in" },
      };
    }
  };

  const signUp = async (
    credentials: RegisterCredentials
  ): Promise<{ error: AuthError | null }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        setState((prev) => ({ ...prev, loading: false }));
        return { error: { message: error.message, code: error.message } };
      }

      if (data.user) {
        // Create user profile
        await createUserProfile(data.user, {
          full_name: credentials.fullName,
          company: credentials.company,
          role: credentials.role,
        });
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      console.error("Sign up error:", error);
      return {
        error: { message: "An unexpected error occurred during registration" },
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<{ error: AuthError | null }> => {
    try {
      if (!state.user) {
        return { error: { message: "No user logged in" } };
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.user.id);

      if (error) {
        return { error: { message: error.message } };
      }

      // Refresh profile data
      const updatedProfile = await getUserProfile(state.user.id);
      setState((prev) => ({ ...prev, profile: updatedProfile }));

      return { error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        error: {
          message: "An unexpected error occurred while updating profile",
        },
      };
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

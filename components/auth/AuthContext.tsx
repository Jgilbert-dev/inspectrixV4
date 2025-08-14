import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { IAuthService, AuthSession, User } from "../../types/auth";
import { SupabaseAuthService } from "../../services/auth/SupabaseAuthService";

// Create service instance - easily swappable
const authService: IAuthService = new SupabaseAuthService();

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contractorId?: string;
  role?: "manager" | "inspector";
}

interface AuthContextType {
  // State
  session: AuthSession | null;
  user: User | null;
  loading: boolean;

  // Actions
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Service access for advanced usage
  authService: IAuthService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange((newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    // Get initial session
    initializeSession();

    return unsubscribe;
  }, []);

  const initializeSession = async () => {
    try {
      const result = await authService.getCurrentSession();
      if (result.success && result.data) {
        setSession(result.data);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to initialize session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login({ email, password });

      if (result.success && result.data) {
        setSession(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authService.register(data);

      if (result.success && result.data) {
        setSession(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const result = await authService.refreshSession();
      if (result.success && result.data) {
        setSession(result.data);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
    login,
    register,
    logout,
    refreshSession,
    authService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

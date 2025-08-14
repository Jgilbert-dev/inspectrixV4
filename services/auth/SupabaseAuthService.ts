// services/auth/SupabaseAuthService.ts
import { supabase } from "../../lib/supabase";
import {
  IAuthService,
  AuthResult,
  LoginCredentials,
  RegisterData,
  AuthSession,
  User,
  PasswordChangeData,
} from "../../types/auth";

export class SupabaseAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult<AuthSession>> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password,
        });

      if (authError) {
        return {
          success: false,
          error: authError.message,
          errorCode: authError.name,
        };
      }

      if (!authData.user || !authData.session) {
        return {
          success: false,
          error: "Authentication failed",
        };
      }

      // Get user profile with contractor info
      const userResult = await this.getUserProfile(authData.user.id);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: "Failed to load user profile",
        };
      }

      const session: AuthSession = {
        user: userResult.data,
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: new Date(authData.session.expires_at! * 1000),
      };

      return {
        success: true,
        data: session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResult<AuthSession>> {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
          errorCode: authError.name,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Failed to create user account",
        };
      }

      // Step 2: Create user profile
      // For now, default to Jim's contractor for testing
      // TODO: Implement invitation-based contractor assignment
      const contractorId =
        data.contractorId || (await this.getDefaultContractorId());

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          contractor_id: contractorId,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role || "inspector",
          must_change_password: false,
        });

      if (profileError) {
        return {
          success: false,
          error: `Profile creation failed: ${profileError.message}`,
        };
      }

      // Step 3: Get complete user data
      const userResult = await this.getUserProfile(authData.user.id);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: "Failed to load user profile after registration",
        };
      }

      const session: AuthSession = {
        user: userResult.data,
        accessToken: authData.session?.access_token || "",
        refreshToken: authData.session?.refresh_token,
      };

      return {
        success: true,
        data: session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }

  async logout(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }

  async getCurrentSession(): Promise<AuthResult<AuthSession>> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!session || !session.user) {
        return {
          success: false,
          error: "No active session",
        };
      }

      const userResult = await this.getUserProfile(session.user.id);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: "Failed to load user profile",
        };
      }

      const authSession: AuthSession = {
        user: userResult.data,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000),
      };

      return {
        success: true,
        data: authSession,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get session",
      };
    }
  }

  async refreshSession(): Promise<AuthResult<AuthSession>> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error || !session) {
        return {
          success: false,
          error: error?.message || "Failed to refresh session",
        };
      }

      return this.getCurrentSession();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Session refresh failed",
      };
    }
  }

  async changePassword(data: PasswordChangeData): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Password change failed",
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Password reset failed",
      };
    }
  }

  async getCurrentUser(): Promise<AuthResult<User>> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          success: false,
          error: error?.message || "No authenticated user",
        };
      }

      return this.getUserProfile(user.id);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get current user",
      };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResult<User>> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser.success || !currentUser.data) {
        return {
          success: false,
          error: "No authenticated user",
        };
      }

      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.firstName !== undefined) {
        updateData.first_name = updates.firstName;
      }
      if (updates.lastName !== undefined) {
        updateData.last_name = updates.lastName;
      }

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", currentUser.data.id);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return this.getUserProfile(currentUser.data.id);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Profile update failed",
      };
    }
  }

  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userResult = await this.getUserProfile(session.user.id);
        if (userResult.success && userResult.data) {
          const authSession: AuthSession = {
            user: userResult.data,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at
              ? new Date(session.expires_at * 1000)
              : undefined,
          };
          callback(authSession);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session.success;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await this.getCurrentSession();
    if (session.success && session.data) {
      return {
        Authorization: `Bearer ${session.data.accessToken}`,
      };
    }
    return {};
  }

  // Private helper methods
  private async getUserProfile(userId: string): Promise<AuthResult<User>> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          *,
          contractors:contractor_id (
            id,
            name
          )
        `
        )
        .eq("id", userId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || "User profile not found",
        };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        contractorId: data.contractor_id,
        contractorName: data.contractors?.name || "Unknown",
        isActive: data.is_active,
        mustChangePassword: data.must_change_password,
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        createdAt: new Date(data.created_at),
      };

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get user profile",
      };
    }
  }

  private async getDefaultContractorId(): Promise<string> {
    // For testing, return Jim's contractor ID
    // TODO: Remove this and implement proper invitation system
    const { data } = await supabase
      .from("contractors")
      .select("id")
      .eq("name", "Jims Crane Inspection")
      .single();

    return data?.id || "";
  }
}

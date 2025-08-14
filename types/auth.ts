// types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "manager" | "inspector";
  contractorId: string;
  contractorName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contractorId?: string; // Optional for invitation-based registration
  role?: "manager" | "inspector";
}

export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Abstract interface that any auth provider must implement
export interface IAuthService {
  // Authentication Methods
  login(credentials: LoginCredentials): Promise<AuthResult<AuthSession>>;
  register(data: RegisterData): Promise<AuthResult<AuthSession>>;
  logout(): Promise<AuthResult<void>>;

  // Session Management
  getCurrentSession(): Promise<AuthResult<AuthSession>>;
  refreshSession(): Promise<AuthResult<AuthSession>>;

  // Password Management
  changePassword(data: PasswordChangeData): Promise<AuthResult<void>>;
  resetPassword(email: string): Promise<AuthResult<void>>;

  // User Profile
  getCurrentUser(): Promise<AuthResult<User>>;
  updateProfile(updates: Partial<User>): Promise<AuthResult<User>>;

  // Session Events
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void;

  // Utility Methods
  isAuthenticated(): Promise<boolean>;
  getAuthHeaders(): Promise<Record<string, string>>;
}

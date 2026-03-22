import { UserRole } from './index';

// Form input types (what user enters)
export interface LoginFormData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  year_level?: number;
  block?: string;
  agreement?: boolean;
  role: UserRole;
}

// API response types (what backend returns)
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: { accessTokenExpiresIn: string; refreshTokenExpiresIn: string };
}

export interface AuthError {
  error: string;
}

// Form state types (for loading/error states)
export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

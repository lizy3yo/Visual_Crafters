import { LoginFormData, RegisterFormData, AuthResponse, AuthError } from '@/types/auth';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Custom error class for better error handling
export class AuthApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        data.error || 'An error occurred',
        response.status
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof AuthApiError) throw error;
    
    // Network errors or other fetch failures
    throw new AuthApiError(
      'Network error. Please check your connection.',
      0
    );
  }
}

// Login API call
export async function loginUser(
  credentials: LoginFormData
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });
}

// Register API call
export async function registerUser(
  userData: RegisterFormData
): Promise<AuthResponse> {
  const payload: any = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    role: userData.role,
  };

  // Add student-specific fields
  if (userData.role === 'student') {
    payload.year_level = userData.year_level;
    payload.block = userData.block;
    payload.agreement = userData.agreement;
  }

  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Store tokens securely
export function storeAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  // For production, consider httpOnly cookies or secure storage
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

// Clear tokens on logout
export function clearAuthTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Get current access token
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

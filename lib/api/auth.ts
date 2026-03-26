import { LoginFormData, RegisterFormData, AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class AuthApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Always send/receive HttpOnly cookies
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) throw new AuthApiError(data.error || 'An error occurred', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof AuthApiError) throw error;
    throw new AuthApiError('Network error. Please check your connection.', 0);
  }
}

export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.email, password: credentials.password, remember: credentials.remember ?? false }),
  });
}

export async function registerUser(userData: RegisterFormData): Promise<AuthResponse> {
  const payload: Record<string, unknown> = {
    firstName: userData.firstName,
    lastName:  userData.lastName,
    email:     userData.email,
    password:  userData.password,
    role:      userData.role,
  };
  if (userData.role === 'student') {
    payload.year_level = userData.year_level;
    payload.block      = userData.block;
    payload.agreement  = userData.agreement;
  }
  return apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logoutUser(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}

export async function refreshAccessToken(): Promise<void> {
  await apiRequest('/api/auth/refresh', { method: 'POST' });
}

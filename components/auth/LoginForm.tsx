'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoginFormData, FormState } from '@/types/auth';
import { loginUser, storeAuthTokens, AuthApiError } from '@/lib/api/auth';

export default function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<LoginFormData, 'role'>>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.error) {
      setFormState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setFormState({ isLoading: true, error: null, success: false });

    try {
      const response = await loginUser({ ...formData, role: 'student' });

      storeAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      setFormState({ isLoading: false, error: null, success: true });

      const redirectPath = response.user.role === 'admin' ? '/admin' : '/student';
      router.push(redirectPath);
    } catch (error) {
      setFormState({
        isLoading: false,
        error: error instanceof AuthApiError ? error.message : 'An unexpected error occurred.',
        success: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1b243b] mb-1.5">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={formState.isLoading}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-[#dbe4f8] bg-[#f8faff] px-4 py-2.5 text-sm text-[#1b243b] placeholder-[#9aa3be] outline-none transition focus:border-[#1f4db8] focus:ring-2 focus:ring-[#1f4db8]/20 disabled:opacity-50"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1b243b] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={formState.isLoading}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[#dbe4f8] bg-[#f8faff] px-4 py-2.5 pr-11 text-sm text-[#1b243b] placeholder-[#9aa3be] outline-none transition focus:border-[#1f4db8] focus:ring-2 focus:ring-[#1f4db8]/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa3be] hover:text-[#1f4db8] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.97 9.97 0 015.39 1.56M15 12a3 3 0 11-4.5-2.598M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {formState.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{formState.error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={formState.isLoading}
        className="w-full rounded-lg bg-[#1f4db8] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f1d89] focus:outline-none focus:ring-2 focus:ring-[#1f4db8]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {formState.isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in…
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}

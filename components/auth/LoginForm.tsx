'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoginFormData, FormState } from '@/types/auth';
import { UserRole } from '@/types';
import { loginUser, storeAuthTokens, AuthApiError } from '@/lib/api/auth';
import RoleSelector from './RoleSelector';

export default function LoginForm() {
  const router = useRouter();
  
  // Form data state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'student' as UserRole,
  });

  // UI state
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: false,
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formState.error) {
      setFormState((prev) => ({ ...prev, error: null }));
    }
  };

  // Handle role selection
  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic check - fields are filled (HTML required attribute handles this)
    if (!formData.email || !formData.password) return;

    // Set loading state
    setFormState({ isLoading: true, error: null, success: false });

    try {
      // Call API
      const response = await loginUser(formData);

      // Store tokens
      storeAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Set success state
      setFormState({ isLoading: false, error: null, success: true });

      // Redirect based on role
      const redirectPath = formData.role === 'superadmin' 
        ? '/superadmin' 
        : `/${formData.role}`;
      
      router.push(redirectPath);

    } catch (error) {
      if (error instanceof AuthApiError) {
        setFormState({
          isLoading: false,
          error: error.message,
          success: false,
        });
      } else {
        setFormState({
          isLoading: false,
          error: 'An unexpected error occurred',
          success: false,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selector */}
      <RoleSelector
        selectedRole={formData.role}
        onRoleChange={handleRoleChange}
      />

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={formState.isLoading}
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={formState.isLoading}
        />
      </div>

      {/* Global Error Message - Generic for security */}
      {formState.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{formState.error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState.isLoading}
        className={`
          w-full flex justify-center py-2 px-4 border border-transparent
          rounded-md shadow-sm text-sm font-medium text-white
          ${
            formState.isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }
        `}
      >
        {formState.isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}

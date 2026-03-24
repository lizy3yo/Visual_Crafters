'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterFormData, FormState } from '@/types/auth';
import { UserRole } from '@/types';
import {
  validateEmail,
  validateStudentEmail,
  validatePassword,
  validateName,
} from '@/lib/utils/validators';
import { registerUser, AuthApiError } from '@/lib/api/auth';
import RoleSelector from './RoleSelector';

export default function RegisterForm() {
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    year_level: undefined,
    block: '',
    agreement: false,
  });

  // UI state
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: false,
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const fieldValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : type === 'number'
      ? parseInt(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    
    // Clear field error
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Clear student-specific fields if switching away from student
      ...(role !== 'student' && {
        year_level: undefined,
        block: '',
        agreement: false,
      }),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    // Name validation
    const firstNameError = validateName(formData.firstName, 'First name');
    const lastNameError = validateName(formData.lastName, 'Last name');
    if (firstNameError) errors.firstName = firstNameError;
    if (lastNameError) errors.lastName = lastNameError;

    // Email validation (role-specific)
    const emailError = formData.role === 'student'
      ? validateStudentEmail(formData.email)
      : validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Student-specific validation
    if (formData.role === 'student') {
      if (!formData.year_level) {
        errors.year_level = 'Year level is required';
      }
      if (!formData.block || formData.block.trim().length === 0) {
        errors.block = 'Block is required';
      }
      if (!formData.agreement) {
        errors.agreement = 'You must agree to the terms';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState({ isLoading: true, error: null, success: false });

    try {
      const response = await registerUser(formData);

      setFormState({ isLoading: false, error: null, success: true });

      const redirectPath = formData.role === 'admin' ? '/admin' : '/student';
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
      {/* Role Selector - only students can self-register */}
      <RoleSelector
        selectedRole={formData.role}
        onRoleChange={handleRoleChange}
        excludeRoles={['admin']}
      />

      {/* Name Fields (Grid Layout) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}
            `}
            disabled={formState.isLoading}
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}
            `}
            disabled={formState.isLoading}
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
          {formData.role === 'student' && (
            <span className="text-gray-500 text-xs ml-2">
              (Gordon College email required)
            </span>
          )}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder={
            formData.role === 'student'
              ? '123456789@gordoncollege.edu.ph'
              : 'you@example.com'
          }
          className={`
            mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}
          `}
          disabled={formState.isLoading}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Student-Specific Fields (Conditional Rendering) */}
      {formData.role === 'student' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div>
            <label htmlFor="year_level" className="block text-sm font-medium text-gray-700">
              Year Level
            </label>
            <select
              id="year_level"
              name="year_level"
              required
              value={formData.year_level || ''}
              onChange={handleChange}
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${fieldErrors.year_level ? 'border-red-500' : 'border-gray-300'}
              `}
              disabled={formState.isLoading}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            {fieldErrors.year_level && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.year_level}</p>
            )}
          </div>

          <div>
            <label htmlFor="block" className="block text-sm font-medium text-gray-700">
              Block
            </label>
            <input
              id="block"
              name="block"
              type="text"
              required
              value={formData.block}
              onChange={handleChange}
              placeholder="e.g., A, B, C"
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${fieldErrors.block ? 'border-red-500' : 'border-gray-300'}
              `}
              disabled={formState.isLoading}
            />
            {fieldErrors.block && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.block}</p>
            )}
          </div>
        </div>
      )}

      {/* Password Fields */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          className={`
            mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}
          `}
          disabled={formState.isLoading}
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be 8+ characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`
            mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
          `}
          disabled={formState.isLoading}
        />
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Student Agreement Checkbox */}
      {formData.role === 'student' && (
        <div className="flex items-start">
          <input
            id="agreement"
            name="agreement"
            type="checkbox"
            checked={formData.agreement}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            disabled={formState.isLoading}
          />
          <label htmlFor="agreement" className="ml-2 block text-sm text-gray-700">
            I agree to the terms and conditions and confirm that I am a Gordon College student
          </label>
        </div>
      )}
      {fieldErrors.agreement && (
        <p className="text-sm text-red-600">{fieldErrors.agreement}</p>
      )}

      {/* Global Error Message */}
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
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}

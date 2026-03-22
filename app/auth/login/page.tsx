import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Visual Crafter Solutions',
  description: 'Sign in to your Visual Crafter Solutions account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#35b8e7]/20 blur-3xl" />
        <div className="absolute -right-36 -top-24 h-64 w-64 rounded-full bg-[#1f4db8]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-[#1f4db8]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-[0_12px_48px_rgba(15,29,137,0.12)] px-8 py-10">

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/landing_page">
              <Image
                src="/Visual_Crafters_Logo.png"
                alt="Visual Crafter Solutions"
                width={52}
                height={52}
                className="h-13 w-13 object-contain"
                priority
              />
            </Link>
            <h1 className="mt-4 text-2xl font-extrabold text-[#0f1d89] tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[#4a5475]">
              Sign in to Visual Crafter Solutions
            </p>
          </div>

          <LoginForm />

          {/* Footer */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[#4a5475]">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-[#1f4db8] hover:text-[#0f1d89] transition-colors"
              >
                Sign up
              </Link>
            </p>
            <Link
              href="/auth/forgot-password"
              className="block text-sm text-[#1f4db8] hover:text-[#0f1d89] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <p className="mt-6 text-center text-xs text-[#4a5475]">
          <Link href="/landing_page" className="hover:text-[#1f4db8] transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

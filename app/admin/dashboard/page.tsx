'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    // Decode role from JWT payload (no verification — server handles that)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        router.replace('/auth/login');
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
      <div className="rounded-2xl bg-white shadow-lg px-10 py-8 text-center">
        <h1 className="text-2xl font-extrabold text-[#0f1d89]">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-[#4a5475]">You are logged in as an admin.</p>
      </div>
    </div>
  );
}

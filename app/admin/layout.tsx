'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.replace('/auth/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') { router.replace('/auth/login'); return; }
      setAuthorized(true);
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-[#1a1d27] overflow-hidden">
      <Sidebar collapsed={collapsed} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5 h-[57px]">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="text-[#9aa3be] hover:text-white transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
          <p className="text-xs font-medium tracking-widest text-[#9aa3be] uppercase">
            Admin Dashboard
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

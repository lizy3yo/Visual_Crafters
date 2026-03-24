'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.role === 'admin') {
          setAuthorized(true);
        } else {
          router.replace('/auth/login');
        }
      })
      .catch(() => router.replace('/auth/login'));
  }, [router]);

  if (!authorized) return null;

  return (
    <ToastProvider>
      <ConfirmProvider>
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (desktop: static | mobile: drawer) ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 lg:static lg:z-auto
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white h-[57px] shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:flex text-gray-500 hover:text-gray-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase select-none">
            Admin Portal
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
    </ConfirmProvider>
    </ToastProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import BottomNav from '@/components/admin/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { logoutUser } from '@/lib/api/auth';

// ── Inner layout (needs access to toast/confirm context) ──────────────────────
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const { toast }   = useToast();
  const { confirm } = useConfirm();

  const [authorized,    setAuthorized]    = useState(false);
  const [collapsed,     setCollapsed]     = useState(false);
  const [isLoggingOut,  setIsLoggingOut]  = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.role === 'admin') setAuthorized(true);
        else router.replace('/auth/login');
      })
      .catch(() => router.replace('/auth/login'));
  }, [router]);

  async function handleLogout() {
    const ok = await confirm({
      title:        'Sign out?',
      description:  'You will be signed out and returned to the login screen.',
      confirmLabel: 'Sign out',
      danger:       true,
    });
    if (!ok) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
      try { sessionStorage.setItem('vc:post_logout_message', JSON.stringify({ message: 'Signed out successfully.', type: 'success' })); } catch {}
      router.replace('/auth/login');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to sign out.', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">

      {/* ── Sidebar (desktop only) ── */}
      <div className="hidden lg:block shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white h-[57px] shrink-0">

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:flex text-gray-500 hover:text-gray-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase select-none flex-1">
            Admin Portal
          </span>

          {/* Mobile / tablet — Sign Out in top bar */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Sign out"
            className="
              lg:hidden flex items-center gap-1.5
              text-xs font-medium text-gray-500 hover:text-red-500
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoggingOut
              ? <Loader2 size={15} className="animate-spin" />
              : <LogOut  size={15} />
            }
            <span>{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>

        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile + tablet only) ── */}
      <BottomNav />

    </div>
  );
}

// ── Root layout — providers wrap the inner layout so hooks work ───────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </ConfirmProvider>
    </ToastProvider>
  );
}

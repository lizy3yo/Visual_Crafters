'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Archive,
  LayoutTemplate,
  CalendarClock,
  Receipt,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',         href: '/admin/dashboard',        icon: LayoutDashboard },
  { label: 'Client Requests',   href: '/admin/client_request',   icon: Archive         },
  { label: 'Templates Manager', href: '/admin/template_manager', icon: LayoutTemplate  },
  { label: 'Reservations',      href: '/admin/reservations',     icon: CalendarClock   },
  { label: 'Transactions',      href: '/admin/transactions',     icon: Receipt         },
];

interface SidebarProps {
  collapsed: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ collapsed, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.replace('/auth/login');
  }

  function handleNavClick() {
    onCloseMobile?.();
  }

  return (
    <aside
      className={`
        flex h-screen flex-col bg-[#13151c] border-r border-white/5 text-white
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-[60px]' : 'w-60'}
      `}
    >
      {/* Brand */}
      <div
        className={`
          flex items-center border-b border-white/5 h-[57px] shrink-0
          ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'}
        `}
      >
        <Image
          src="/Visual_Crafters_Logo_circle.png"
          alt="Visual Crafter Solutions"
          width={30}
          height={30}
          className="rounded-full object-contain shrink-0"
        />
        {!collapsed && (
          <span className="text-sm font-semibold leading-tight tracking-wide text-white truncate">
            Visual Crafter
          </span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <p className="px-4 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#4b5563]">
          Main Menu
        </p>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              title={collapsed ? label : undefined}
              className={`
                group flex items-center rounded-lg py-2.5 text-sm font-medium
                transition-colors duration-150
                ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                ${active
                  ? 'bg-violet-500/15 text-violet-400'
                  : 'text-[#9aa3be] hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${
                  active ? 'text-violet-400' : 'text-[#6b7280] group-hover:text-white'
                }`}
              />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="px-2 py-3 border-t border-white/5 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`
            flex w-full items-center rounded-lg py-2.5 text-sm font-medium
            text-[#6b7280] transition-colors hover:bg-red-500/10 hover:text-red-400
            ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
          `}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Archive,
  Cookie,
  Clock,
  Briefcase,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',         href: '/admin/dashboard',        icon: Home      },
  { label: 'Client Requests',   href: '/admin/client_request',   icon: Archive   },
  { label: 'Templates Manager', href: '/admin/template_manager', icon: Cookie    },
  { label: 'Reservations',      href: '/admin/reservations',     icon: Clock     },
  { label: 'Transactions',      href: '/admin/transactions',     icon: Briefcase },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.replace('/auth/login');
  }

  return (
    <aside
      className={`
        flex h-screen flex-col bg-[#13151c] text-white
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-[60px]' : 'w-64'}
      `}
    >
      {/* Brand */}
      <div
        className={`
          flex items-center border-b border-white/5 h-[57px]
          ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}
        `}
      >
        <Image
          src="/Visual_Crafters_Logo_circle.png"
          alt="Visual Crafter Solutions"
          width={32}
          height={32}
          className="rounded-full object-contain shrink-0"
        />
        {!collapsed && (
          <span className="text-sm font-semibold leading-tight tracking-wide text-white truncate">
            Visual Crafter Solutions
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`
                group flex items-center rounded-lg py-2.5 text-sm font-medium
                transition-colors duration-150
                ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                ${active
                  ? 'bg-white/10 text-[#7c6af7]'
                  : 'text-[#9aa3be] hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${active ? 'text-[#7c6af7]' : 'text-[#9aa3be] group-hover:text-white'}`}
              />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="px-2 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`
            flex w-full items-center rounded-lg py-2.5 text-sm font-medium
            text-[#9aa3be] transition-colors hover:bg-white/5 hover:text-red-400
            ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
          `}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}

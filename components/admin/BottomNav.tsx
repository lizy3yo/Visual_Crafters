'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Archive,
  LayoutTemplate,
  CalendarClock,
  Receipt,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard',        icon: LayoutDashboard },
  { label: 'Requests',   href: '/admin/client_request',   icon: Archive         },
  { label: 'Templates',  href: '/admin/template_manager', icon: LayoutTemplate  },
  { label: 'Schedule',   href: '/admin/reservations',     icon: CalendarClock   },
  { label: 'Revenue',    href: '/admin/transactions',     icon: Receipt         },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="
        lg:hidden
        fixed bottom-0 inset-x-0 z-40
        bg-[#13151c]
        border-t border-white/5
        shadow-[0_-2px_16px_rgba(0,0,0,0.35)]
      "
    >
      <ul className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 h-full w-full group select-none"
              >
                {/* Icon pill — exact same tokens as desktop sidebar */}
                <span
                  className={`
                    flex items-center justify-center rounded-full transition-all duration-200
                    ${active
                      ? 'bg-violet-500/15 w-12 h-7'
                      : 'w-7 h-7 group-hover:bg-white/5'
                    }
                  `}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`
                      transition-colors duration-200 shrink-0
                      ${active ? 'text-violet-400' : 'text-[#6b7280] group-hover:text-white'}
                    `}
                  />
                </span>

                {/* Label */}
                <span
                  className={`
                    text-[10px] font-medium leading-none transition-colors duration-200
                    ${active ? 'text-violet-400' : 'text-[#9aa3be] group-hover:text-white'}
                  `}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

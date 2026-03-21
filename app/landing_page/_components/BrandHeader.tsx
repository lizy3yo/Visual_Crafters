"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Services", href: "/landing_page/services" },
  { label: "Templates", href: "/landing_page/templates" },
  { label: "Request", href: "/landing_page/request" },
  { label: "Contact", href: "/landing_page/contact" },
];

export default function BrandHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e6eefb] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="relative mx-auto flex h-[4.5rem] w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="relative flex w-full items-center">
          <div className="flex items-center">
            <Link href="/landing_page" className="flex items-center gap-3">
              <Image
                src="/Visual_Crafters_Logo.png"
                alt="Visual Crafters logo"
                width={38}
                height={38}
                className="h-9 w-9 object-contain"
                priority
              />
              <span className="text-sm font-semibold tracking-wide text-[#0f1d89] hidden sm:inline-block">
                Visual Crafter Solutions
              </span>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-7">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-7">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-[#222834] transition-colors hover:text-[#1f4db8]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/auth/login"
              className="hidden rounded-full bg-[#1f4db8] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f1d89] md:inline-flex"
            >
              Sign In
            </Link>

            <button
              className="inline-flex items-center rounded-md bg-white/0 p-2 text-[#1b243b] md:hidden"
              aria-expanded={open}
              aria-label="Toggle navigation"
              onClick={() => setOpen((s) => !s)}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                {open ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="absolute left-0 top-full w-full bg-white/95 px-4 py-4 shadow-md md:hidden">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-[#1b243b] hover:bg-[#f1f5fb]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-[#1f4db8] px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

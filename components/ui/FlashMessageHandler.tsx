"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function FlashMessageHandler() {
  const { toast } = useToast();
  const pathname = usePathname();

  // Re-check sessionStorage whenever the route changes so messages set
  // before navigation (e.g. post-login) are picked up on the destination page.
  useEffect(() => {
    try {
      const keys = ['vc:post_login_message', 'vc:post_logout_message'];
      for (const key of keys) {
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed?.message) {
          toast(parsed.message, parsed.type ?? 'info');
          sessionStorage.removeItem(key);
        }
      }
    } catch (_) {}
  }, [toast, pathname]);

  return null;
}

import React from 'react';
import { cn } from '@/lib/utils/cn';

type Props = {
  status?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'light' | 'solid';
};

const MAP: Record<string, { bg: string; border: string; text: string; solid?: string }> = {
  Pending:       { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-600', solid: 'bg-amber-500 text-white' },
  'In Progress': { bg: 'bg-sky-50',    border: 'border-sky-200',   text: 'text-sky-700',   solid: 'bg-sky-500 text-white' },
  Completed:     { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',solid: 'bg-emerald-500 text-white' },
  Cancelled:     { bg: 'bg-red-50',     border: 'border-red-200',   text: 'text-red-600',   solid: 'bg-red-500 text-white' },

  // reservation-specific
  Scheduled:     { bg: 'bg-gray-50',    border: 'border-gray-100',  text: 'text-gray-700' },
  Serving:       { bg: 'bg-sky-50',     border: 'border-sky-200',   text: 'text-sky-700' },
  Done:          { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700' },

  default:       { bg: 'bg-gray-50',    border: 'border-gray-100',  text: 'text-gray-600' },
};

export default function StatusBadge({ status, className, size = 'sm', variant = 'light' }: Props) {
  if (!status) return null;
  const key = MAP[status] ? status : 'default';
  const cfg = MAP[key] || MAP.default;

  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  const base = 'inline-flex items-center rounded-full font-medium';
  const style = variant === 'solid' && cfg.solid ? cfg.solid : `${cfg.bg} ${cfg.text} border ${cfg.border}`;

  return (
    <span className={cn(base, padding, style, className)}>{status}</span>
  );
}

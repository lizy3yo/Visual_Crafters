'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Search, X, Eye, ShoppingCart, LayoutTemplate } from 'lucide-react';
import BrandHeader from '../_components/BrandHeader';
import BrandFooter from '../_components/BrandFooter';
import IconRunway from '../_components/IconRunway';
import BuyRequestModal from '@/components/landing/BuyRequestModal';

interface Template {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  status: 'published' | 'draft';
  createdAt: string;
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="w-full aspect-4/3 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightbox
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={20} />
      </button>
      <div className="rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-xl" />
      </div>
    </div>
  );
}

// Template card
function TemplateCard({ template, onBuy }: { template: Template; onBuy: (t: Template) => void }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {lightbox && (
        <Lightbox src={template.imageUrl} alt={template.title} onClose={() => setLightbox(false)} />
      )}
      <div className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        <div
          className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={template.imageUrl}
            alt={template.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-2 p-5 flex-1">
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
              {template.category}
            </p>
            <h3 className="text-base font-bold text-[#1b243b] leading-snug">{template.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
            <span className="text-base font-bold text-blue-700">
              &#8369;{template.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightbox(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Eye size={13} />
                View
              </button>
              <button
                onClick={() => onBuy(template)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors">
                <ShoppingCart size={13} />
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates]     = useState<Template[]>([]);
  const [categories, setCategories]   = useState<string[]>([]);
  const [activeFilter, setFilter]     = useState('all');
  const [search, setSearch]           = useState('');
  const [initializing, setInitializing] = useState(true);
  const [buyTarget, setBuyTarget]     = useState<Template | null>(null);
  const searchTimeout                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTemplates = useCallback(async (category = 'all', q = '') => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (q.trim()) params.set('search', q.trim());
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/templates${qs}`);
      const data = await res.json();
      if (res.ok) {
        const list: Template[] = data.templates ?? [];
        setTemplates(list);
        if (category === 'all' && !q) {
          const cats = Array.from(new Set(list.map(t => t.category))).sort();
          setCategories(cats);
        }
      }
    } catch { /* silent */ } finally {
      setInitializing(false);
    }
  }, []);

  // Initial load + SSE
  useEffect(() => {
    fetchTemplates();

    const es = new EventSource('/api/templates/sse');

    es.addEventListener('template:created', (e: MessageEvent) => {
      const t: Template = JSON.parse(e.data);
      if (t.status !== 'published') return;
      setTemplates(prev => [t, ...prev]);
      setCategories(prev => prev.includes(t.category) ? prev : [...prev, t.category].sort());
    });

    es.addEventListener('template:updated', (e: MessageEvent) => {
      const t: Template = JSON.parse(e.data);
      setTemplates(prev =>
        t.status === 'published'
          ? prev.map(x => x._id === t._id ? t : x)
          : prev.filter(x => x._id !== t._id)
      );
    });

    es.addEventListener('template:deleted', (e: MessageEvent) => {
      const { id } = JSON.parse(e.data);
      setTemplates(prev => prev.filter(x => x._id !== id));
    });

    es.onerror = () => es.close();
    return () => es.close();
  }, [fetchTemplates]);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTemplates(activeFilter, value);
    }, 350);
  }

  function handleFilter(cat: string) {
    setFilter(cat);
    fetchTemplates(cat, search);
  }

  const displayed = templates;

  return (
    <div className="min-h-screen bg-white text-[#1b243b] flex flex-col relative">
      <BrandHeader />

      {/* Full-bleed icon runway — must sit outside the constrained main */}
      <div className="absolute inset-x-0 top-[5rem] sm:top-[5rem] pointer-events-none z-0">
        <IconRunway />
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Hero + Search + Filters — unified block */}
        <div className="relative text-center pt-14 pb-8">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-[#1b243b] sm:text-5xl">
              Design{' '}
              <span className="text-[#1f4db8]">Showcase</span>
            </h1>
            <p className="mt-3 text-base text-[#4a5475] max-w-xl mx-auto leading-relaxed">
              Browse our portfolio of sample works and ready-made templates.
              Find the perfect design for your project.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto mt-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {['all', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeFilter === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="pb-16">
          {initializing ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 mb-5">
                <LayoutTemplate size={36} className="text-blue-300" />
              </div>
              <h3 className="text-base font-semibold text-[#1b243b] mb-1">
                {search ? 'No results found' : 'No templates yet'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {search
                  ? `We couldn't find any templates matching "${search}". Try a different keyword.`
                  : 'Check back soon — new designs are on the way.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map(t => (
                <TemplateCard key={t._id} template={t} onBuy={setBuyTarget} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BrandFooter />

      {/* Buy Request Modal */}
      {buyTarget && (
        <BuyRequestModal
          template={buyTarget}
          onClose={() => setBuyTarget(null)}
        />
      )}
    </div>
  );
}

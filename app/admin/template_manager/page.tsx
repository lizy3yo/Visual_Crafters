'use client';

import { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, X, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { SkeletonTemplateCard } from '@/components/ui/Skeleton';

// Types
interface Template {
  _id:         string;
  title:       string;
  description: string;
  price:       number;
  category:    string;
  imageUrl:    string;
  status:      'published' | 'draft';
  createdAt:   string;
}

interface FormState {
  title:       string;
  description: string;
  price:       string;
  category:    string;
  newCategory: string;
  status:      'published' | 'draft';
  imageData:   string | null;
  imagePreview:string | null;
}

const EMPTY_FORM: FormState = {
  title: '', description: '', price: '', category: '',
  newCategory: '', status: 'published', imageData: null, imagePreview: null,
};

const STATUS_STYLES: Record<string, string> = {
  published: 'text-emerald-600',
  draft:     'text-gray-400',
};

// Image Lightbox
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={20} />
      </button>
      <div
        className="rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="block max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-xl"
        />
      </div>
    </div>
  );
}

// Template Card
function TemplateCard({
  template, onEdit, onDelete,
}: {
  template: Template;
  onEdit:   (t: Template) => void;
  onDelete: (t: Template) => void;
}) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {lightbox && (
        <ImageLightbox src={template.imageUrl} alt={template.title} onClose={() => setLightbox(false)} />
      )}
      <div className="group rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
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
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">{template.category}</p>
            <h3 className="text-sm font-semibold text-gray-800 leading-snug">{template.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
            <p className="text-sm font-bold text-sky-600 mt-1.5">&#8369;{template.price.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button aria-label="Edit template" onClick={() => onEdit(template)} className="p-1.5 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                <Pencil size={14} />
              </button>
              <button aria-label="Delete template" onClick={() => onDelete(template)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_STYLES[template.status]}`}>
              <Eye size={12} />
              {template.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// Template Form Modal
function TemplateFormModal({
  editing, categories, onClose, onSaved,
}: {
  editing:    Template | null;
  categories: string[];
  onClose:    () => void;
  onSaved:    (t: Template) => void;
}) {
  const { toast } = useToast();
  const [form, setForm]       = useState<FormState>(() =>
    editing ? {
      title: editing.title, description: editing.description, price: String(editing.price),
      category: editing.category, newCategory: '', status: editing.status,
      imageData: null, imagePreview: editing.imageUrl,
    } : EMPTY_FORM
  );
  const [saving, setSaving]   = useState(false);
  const [allCats, setAllCats] = useState<string[]>(categories);
  const fileRef               = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const data = ev.target?.result as string;
      setForm(prev => ({ ...prev, imageData: data, imagePreview: data }));
    };
    reader.readAsDataURL(file);
  }

  function addCategory() {
    const cat = form.newCategory.trim();
    if (!cat) return;
    if (!allCats.includes(cat)) setAllCats(prev => [...prev, cat]);
    setForm(prev => ({ ...prev, category: cat, newCategory: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim())       { toast('Title is required.',       'error'); return; }
    if (!form.description.trim()) { toast('Description is required.', 'error'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { toast('Enter a valid price.', 'error'); return; }
    if (!form.category)           { toast('Category is required.',    'error'); return; }
    if (!editing && !form.imageData) { toast('Please upload an image.', 'error'); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(), description: form.description.trim(),
        price: Number(form.price), category: form.category, status: form.status,
      };
      if (form.imageData) payload.imageData = form.imageData;

      const url    = editing ? `/api/admin/templates/${editing._id}` : '/api/admin/templates';
      const method = editing ? 'PATCH' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const data   = await res.json();

      if (!res.ok) { toast(data.error ?? 'Something went wrong.', 'error'); return; }
      toast(editing ? 'Template updated.' : 'Template created.', 'success');
      onSaved(data.template);
      onClose();
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cover Image</label>
            <div onClick={() => fileRef.current?.click()} className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors flex items-center justify-center">
              {form.imagePreview ? (
                <Image src={form.imagePreview} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={24} />
                  <span className="text-xs">Click to upload (max 5 MB)</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} maxLength={100} placeholder="e.g. Modern Tech Logo" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} rows={3} placeholder="Brief description of this template..." className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (&#8369;)</label>
            <input type="number" min={0} step={0.01} value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition">
              <option value="">Select a category</option>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <input type="text" value={form.newCategory} onChange={e => set('newCategory', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} placeholder="Add new category..." className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition" />
              <button type="button" onClick={addCategory} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
            <div className="flex gap-3">
              {(['published', 'draft'] as const).map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status', s)} className="accent-sky-500" />
                  <span className="text-sm text-gray-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit as React.MouseEventHandler<HTMLButtonElement>} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-60 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Page
export default function TemplateManagerPage() {
  const { toast }   = useToast();
  const { confirm } = useConfirm();

  const [templates,    setTemplates]    = useState<Template[]>([]);
  const [categories,   setCategories]   = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Template | null>(null);

  const fetchTemplates = useCallback(async (category = 'all') => {
    setLoading(true);
    try {
      const qs   = category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const res  = await fetch(`/api/admin/templates${qs}`, { credentials: 'include' });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (res.ok) setTemplates(data.templates ?? []);
      else toast(data.error ?? 'Failed to load templates.', 'error');
    } catch {
      toast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/templates/categories', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        const cats: string[] = (data.categories ?? []).map((c: unknown) =>
          typeof c === 'string' ? c : (c as { name: string }).name
        );
        setCategories(cats);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [fetchTemplates, fetchCategories]);

  useEffect(() => {
    const es = new EventSource('/api/admin/templates/sse', { withCredentials: true });
    es.addEventListener('template:created', (e: MessageEvent) => {
      const t: Template = JSON.parse(e.data);
      setTemplates(prev => [t, ...prev]);
      setCategories(prev => prev.includes(t.category) ? prev : [...prev, t.category].sort());
    });
    es.addEventListener('template:updated', (e: MessageEvent) => {
      const t: Template = JSON.parse(e.data);
      setTemplates(prev => prev.map(x => x._id === t._id ? t : x));
    });
    es.addEventListener('template:deleted', (e: MessageEvent) => {
      const { id } = JSON.parse(e.data);
      setTemplates(prev => prev.filter(x => x._id !== id));
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(t: Template) { setEditing(t); setModalOpen(true); }

  async function handleDelete(t: Template) {
    const ok = await confirm({
      title: 'Delete Template',
      description: `"${t.title}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      const res  = await fetch(`/api/admin/templates/${t._id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? 'Delete failed.', 'error'); return; }
      toast('Template deleted.', 'success');
      setTemplates(prev => prev.filter(x => x._id !== t._id));
    } catch {
      toast('Network error.', 'error');
    }
  }

  function handleSaved(t: Template) {
    setTemplates(prev => {
      const exists = prev.find(x => x._id === t._id);
      return exists ? prev.map(x => x._id === t._id ? t : x) : [t, ...prev];
    });
    if (!categories.includes(t.category)) {
      setCategories(prev => [...prev, t.category].sort());
    }
  }

  function handleFilterChange(cat: string) {
    setActiveFilter(cat);
    fetchTemplates(cat);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Templates Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage and publish design templates for clients.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 transition-colors shadow-sm">
          <Plus size={15} />
          Add Template
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => handleFilterChange(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === cat
                ? 'bg-sky-500 text-white border-sky-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTemplateCard key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-400">No templates found. Click &ldquo;Add Template&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map(t => (
            <TemplateCard key={t._id} template={t} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modalOpen && (
        <TemplateFormModal
          editing={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

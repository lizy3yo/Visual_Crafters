'use client';

import { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const SERVICES = [
  'Logo Design',
  'Branding & Marketing Materials',
  'Presentations & Infographics',
  'Customized Design Request',
];

// Map template categories to the closest service option
function categoryToService(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('logo'))                                          return 'Logo Design';
  if (c.includes('brand') || c.includes('market') || c.includes('pubmat') || c.includes('flyer') || c.includes('poster'))
                                                                   return 'Branding & Marketing Materials';
  if (c.includes('present') || c.includes('infograph') || c.includes('slide'))
                                                                   return 'Presentations & Infographics';
  // Exact match fallback
  const exact = SERVICES.find(s => s.toLowerCase() === c);
  if (exact) return exact;
  return 'Customized Design Request';
}
interface Template {
  _id:   string;
  title: string;
  price: number;
  category: string;
}

interface Props {
  template: Template;
  onClose:  () => void;
}

export default function BuyRequestModal({ template, onClose }: Props) {
  const { toast } = useToast();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName:    '',
    contact:     '',
    email:       '',
    service:     template.category,
    deadline:    '',
    description: '',
  });
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function handleFile(f: File | null) {
    if (!f) return;
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      toast('Only PNG, JPG, or PDF files are allowed.', 'error');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast('File must be 10 MB or smaller.', 'error');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())  e.fullName    = 'Full name is required.';
    if (!form.contact.trim())   e.contact     = 'Contact number is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                                e.email       = 'A valid email is required.';
    if (!form.deadline.trim())  e.deadline    = 'Preferred deadline is required.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      // Convert file to base64 if present
      let fileData: string | undefined;
      if (file) {
        fileData = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
      }

      const res = await fetch('/api/client-requests', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          templateId:    template._id,
          templateTitle: template.title,
          templatePrice: template.price,
          fileData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Failed to submit request.', 'error');
        return;
      }

      toast('Request submitted successfully! We\'ll be in touch soon.', 'success');
      onClose();
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Submit a Request</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Template: <span className="font-medium text-[#1f4db8]">{template.title}</span>
              {' · '}
              <span className="font-medium text-gray-600">₱{template.price.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="buy-request-form" onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Row: Full Name + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="John Ian Ormides"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.fullName ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.contact}
                  onChange={e => set('contact', e.target.value)}
                  placeholder="012 3456 7891"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.contact ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="john@example.com"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Row: Service + Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Service Needed <span className="text-red-500">*</span>
                </label>
                <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-700 flex items-center justify-between cursor-not-allowed">
                  <span>{form.service}</span>
                  <span className="text-xs text-gray-400 italic">auto-filled</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Preferred Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => set('deadline', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.deadline ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Project Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Tell us about your project..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition resize-none"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Upload Reference File{' '}
                <span className="font-normal text-gray-400 italic">(Optional)</span>
              </label>
              <div
                onClick={() => !file && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors cursor-pointer ${
                  dragging ? 'border-[#1f4db8] bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-[#1f4db8]/50 hover:bg-blue-50/30'
                }`}
              >
                {file ? (
                  preview ? (
                    /* Image preview */
                    <div className="relative w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-40 object-contain rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeFile(); }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 shadow text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Remove file"
                      >
                        <X size={13} />
                      </button>
                      <p className="mt-2 text-xs text-center text-gray-400 truncate">{file.name}</p>
                    </div>
                  ) : (
                    /* PDF — show file name + icon */
                    <div className="flex items-center gap-3 w-full px-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 shrink-0">
                        <Upload size={16} className="text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeFile(); }}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    <Upload size={20} className="text-gray-400" />
                    <p className="text-xs text-gray-500 text-center">
                      Click to upload or drag and drop
                      <br />
                      <span className="text-gray-400">PNG, JPG, PDF up to 10 MB</span>
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2.5 shrink-0">
          <button
            type="submit"
            form="buy-request-form"
            disabled={submitting}
            className="w-full rounded-xl bg-[#1f4db8] hover:bg-[#0f1d89] disabled:opacity-60 text-white text-sm font-semibold py-3 transition-colors shadow-sm"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

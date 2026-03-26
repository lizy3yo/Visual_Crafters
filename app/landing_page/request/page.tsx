'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import BrandHeader from '../_components/BrandHeader';
import BrandFooter from '../_components/BrandFooter';
import IconRunway from '../_components/IconRunway';
import { useToast } from '@/components/ui/Toast';

const SERVICES = [
  'Logo Design',
  'Branding & Marketing Materials',
  'Presentations & Infographics',
  'Customized Design Request',
  'Other',
];

export default function RequestPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName:    '',
    contact:     '',
    email:       '',
    service:     '',
    deadline:    '',
    description: '',
  });
  const [file,       setFile]       = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const isOther = form.service === 'Other';

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
    if (!form.fullName.trim())  e.fullName   = 'Full name is required.';
    if (!form.contact.trim())   e.contact    = 'Contact number is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                                e.email      = 'A valid email is required.';
    if (!form.service)          e.service    = 'Please select a service.';
    if (!form.deadline.trim())  e.deadline   = 'Preferred deadline is required.';
    if (isOther && !form.description.trim())
                                e.description = 'Project description is required for "Other" service.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
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
        body: JSON.stringify({ ...form, fileData }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Failed to submit request.', 'error');
        return;
      }

      toast("Request submitted! We'll be in touch soon.", 'success');
      // Reset form
      setForm({ fullName: '', contact: '', email: '', service: '', deadline: '', description: '' });
      removeFile();
      setErrors({});
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1b243b]">
      <BrandHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-[#e6eefb]">
        <div className="absolute inset-x-0 top-2 pointer-events-none">
          <IconRunway />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-[#1b243b] sm:text-5xl">
            Request{' '}
            <span className="text-[#1f4db8]">Design</span>
          </h1>
          <p className="mt-4 text-base text-[#4a5475] max-w-lg mx-auto">
            Fill out the form below and our team will bring your vision to life.
          </p>
        </div>
      </section>

      {/* Main panel */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #2a2fd4 0%, #1a6fd4 55%, #4ab8e8 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/4 bottom-0 h-56 w-56 rounded-full bg-[#4ab8e8]/20 blur-2xl" />
          <div className="absolute right-10 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-stretch">

            {/* Left — branding panel */}
            <div className="hidden lg:flex flex-col items-center justify-between py-9 px-2 text-center">
              <Image
                src="/Visual_Crafters_Logo_TransparentBg.png"
                alt="Visual Crafters"
                width={360}
                height={360}
                className="drop-shadow-2xl"
              />
              <div className="text-left">
                <h2 className="text-5xl font-extrabold text-white leading-snug">
                  Let&apos;s Connect
                </h2>
                <p className="mt-3 text-lg text-white/80 leading-relaxed">
                  Have cool idea for new project? Need reliable partner to improve your product? We are here to help you uncomplicate your product development
                </p>
              </div>
              <div
                className="relative overflow-hidden shadow-2xl"
                style={{ width: '360px', height: '280px', borderRadius: '45%', border: '10px solid #facc15', background: '#fff' }}
              >
                <Image src="/woman-character.png" alt="Woman working on design" fill className="object-cover object-center" />
              </div>
            </div>

            {/* Right — form card */}
            <div className="rounded-2xl bg-white shadow-2xl p-7 sm:p-9 flex flex-col h-full">
              <form onSubmit={handleSubmit} noValidate className="space-y-5 flex flex-col flex-1">

                {/* Row: Full Name + Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
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
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
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
                  <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
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
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Service Needed <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.service}
                      onChange={e => set('service', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.service ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <option value="" disabled>Select a service</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Preferred Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => set('deadline', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors.deadline ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
                  </div>
                </div>

                {/* Project Description — required when Other */}
                <div className="flex flex-col flex-1">
                  <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                    Project Description
                    {isOther && <span className="text-red-500"> *</span>}
                    {!isOther && <span className="font-normal text-gray-400 italic"> (Optional)</span>}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder={isOther ? 'Please describe your project in detail...' : 'Tell us about your project...'}
                    className={`flex-1 w-full rounded-lg border px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>

                {/* File upload */}
                <div className="flex flex-col flex-1">
                  <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                    Upload Reference File{' '}
                    <span className="font-normal text-gray-400 italic">(Optional)</span>
                  </label>
                  <div
                    onClick={() => !file && fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                    className={`flex-1 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors cursor-pointer ${
                      dragging ? 'border-[#1f4db8] bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-[#1f4db8]/50 hover:bg-blue-50/30'
                    }`}
                  >
                    {file ? (
                      preview ? (
                        <div className="relative w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg border border-gray-200" />
                          <button type="button" onClick={e => { e.stopPropagation(); removeFile(); }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 shadow text-gray-500 hover:text-red-500 transition-colors" aria-label="Remove file">
                            <X size={13} />
                          </button>
                          <p className="mt-2 text-xs text-center text-gray-400 truncate">{file.name}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full px-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 shrink-0">
                            <Upload size={16} className="text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                          </div>
                          <button type="button" onClick={e => { e.stopPropagation(); removeFile(); }}
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0" aria-label="Remove file">
                            <X size={14} />
                          </button>
                        </div>
                      )
                    ) : (
                      <>
                        <Upload size={22} className="text-gray-400" />
                        <p className="text-xs text-gray-500 text-center">
                          Click to upload or drag and drop
                          <br />
                          <span className="text-gray-400">PNG, JPG, PDF up to 10 MB</span>
                        </p>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                      onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Actions */}
                <div className="space-y-3 mt-auto">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#1f4db8] hover:bg-[#0f1d89] disabled:opacity-60 text-white text-sm font-semibold py-3 transition-colors shadow-sm"
                  >
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setForm({ fullName: '', contact: '', email: '', service: '', deadline: '', description: '' });
                      removeFile();
                      setErrors({});
                    }}
                    className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-3 transition-colors"
                  >
                    Cancel Request
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
}

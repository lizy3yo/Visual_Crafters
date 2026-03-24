'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import BrandHeader from '../_components/BrandHeader';
import BrandFooter from '../_components/BrandFooter';
import IconRunway from '../_components/IconRunway';

const SERVICES = [
  'Logo Design',
  'Branding & Marketing Materials',
  'Presentations & Infographics',
  'Customized Design Request',
];

export default function RequestPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File | null) {
    if (!f) return;
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowed.includes(f.type)) return;
    if (f.size > 10 * 1024 * 1024) return;
    setFile(f);
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
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/4 bottom-0 h-56 w-56 rounded-full bg-[#4ab8e8]/20 blur-2xl" />
          <div className="absolute right-10 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-stretch">

            {/* Left — branding panel */}
            <div className="hidden lg:flex flex-col items-center justify-between py-9 px-2 text-center">
              {/* Logo */}
              <Image
                src="/Visual_Crafters_Logo_TransparentBg.png"
                alt="Visual Crafters"
                width={360}
                height={360}
                className="drop-shadow-2xl"
              />

              {/* Let's Connect */}
              <div className="text-left">
                <h2 className="text-5xl font-extrabold text-white leading-snug">
                  Let&apos;s Connect
                </h2>
                <p className="mt-3 text-lg text-white/80 leading-relaxed">
                  Have cool idea for new project? Need reliable partner to improve your product? We are here to help you uncomplicate your product development
                </p>
              </div>

              {/* Oval illustration */}
              <div
                className="relative overflow-hidden shadow-2xl"
                style={{
                  width: '360px',
                  height: '280px',
                  borderRadius: '45%',
                  border: '10px solid #facc15',
                  background: '#fff',
                }}
              >
                <Image
                  src="/woman-character.png"
                  alt="Woman working on design"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right — form card */}
            <div className="rounded-2xl bg-white shadow-2xl p-7 sm:p-9 flex flex-col h-full">
              <form className="space-y-5 flex flex-col flex-1" onSubmit={e => e.preventDefault()}>

                {/* Row: Full Name + Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Ian Ormides"
                      required
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="012 3456 7891"
                      required
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition"
                  />
                </div>

                {/* Row: Service + Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Service Needed <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition"
                    >
                      <option value="" disabled>Select a service</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                      Preferred Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Project Description */}
                <div className="flex flex-col flex-1">
                  <label className="block text-xs font-semibold text-[#1b243b] mb-1.5">
                    Project Description
                  </label>
                  <textarea
                    placeholder="Tell us about your project..."
                    className="flex-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition resize-none"
                  />
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
                    onDrop={e => {
                      e.preventDefault();
                      setDragging(false);
                      handleFile(e.dataTransfer.files?.[0] ?? null);
                    }}
                    className={`flex-1 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors cursor-pointer ${
                      dragging
                        ? 'border-[#1f4db8] bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-[#1f4db8]/50 hover:bg-blue-50/30'
                    }`}
                  >
                    {file ? (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFile(null); }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove file"
                        >
                          <X size={15} />
                        </button>
                      </div>
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
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      className="hidden"
                      onChange={e => handleFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-100" />

                {/* Actions */}
                <div className="space-y-3 mt-auto">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1f4db8] hover:bg-[#0f1d89] text-white text-sm font-semibold py-3 transition-colors shadow-sm"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
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

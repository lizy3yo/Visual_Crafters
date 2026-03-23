'use client';

import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Template {
  id:       number;
  title:    string;
  category: string;
  image:    string;
  status:   'Published' | 'Draft';
}

// ── Static mock data (replace with real fetches without touching logic) ───────
const TEMPLATES: Template[] = [
  { id: 1, title: 'Modern Tech Logo',      category: 'Logo',         image: '/our_services/Logo Design.png',                          status: 'Published' },
  { id: 2, title: 'Publication Materials', category: 'Marketing',    image: '/our_services/Branding and Marketing Materials.png',     status: 'Published' },
  { id: 3, title: 'Infographics',          category: 'Infographic',  image: '/our_services/Presentations and Infographics.png',       status: 'Published' },
  { id: 4, title: 'Poster',                category: 'Marketing',    image: '/our_services/Customized Design Requests.png',           status: 'Published' },
  { id: 5, title: 'Presentation Materials',category: 'Presentation', image: '/our_services/Presentations and Infographics.png',       status: 'Published' },
  { id: 6, title: 'Certificates',          category: 'Document',     image: '/our_services/Customized Design Requests.png',           status: 'Published' },
];

const STATUS_STYLES: Record<string, string> = {
  Published: 'text-emerald-600',
  Draft:     'text-gray-400',
};

// ── Template Card ─────────────────────────────────────────────────────────────
function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="group rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">

      {/* Thumbnail */}
      <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
        <Image
          src={template.image}
          alt={template.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
            {template.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug">
            {template.title}
          </h3>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              aria-label="Edit template"
              className="p-1.5 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              aria-label="Delete template"
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_STYLES[template.status]}`}>
            <Eye size={12} />
            {template.status}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TemplateManagerPage() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Templates Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage and publish design templates for clients.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 transition-colors shadow-sm">
          <Plus size={15} />
          Add Template
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

    </div>
  );
}

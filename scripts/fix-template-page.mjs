import { readFileSync, writeFileSync } from 'fs';

const file = 'app/admin/template_manager/page.tsx';
const lines = readFileSync(file, 'utf8').split('\n');

const result = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const next = lines[i + 1] ?? '';
  const trimmedNext = next.trimStart();

  // If current line ends without closing a JSX attribute string (no closing quote at end)
  // and next line starts with a Tailwind class fragment, merge them
  const endsOpenString = /["'`][^"'`]*$/.test(line.trimEnd()) === false;
  const nextIsTailwind = /^(hover:|focus:|active:|text-|bg-|border-|rounded-|flex|items-|justify-|gap-|px-|py-|p-|w-|h-|max-|min-|overflow-|cursor-|transition|shadow-|object-|aspect-|shrink-|space-|grid-|col-|inset-|top-|right-|bottom-|left-|z-|animate-|placeholder-|tracking-|leading-|line-|font-|mb-|mt-|mr-|ml-|sr-only|uppercase|capitalize|resize-none|accent-)/.test(trimmedNext);

  if (nextIsTailwind && line.trimEnd().endsWith('"') === false && line.includes('className=')) {
    result.push(line.trimEnd() + ' ' + trimmedNext.trimEnd());
    i++; // skip next line since we merged it
  } else {
    result.push(line);
  }
}

writeFileSync(file, result.join('\n'), 'utf8');
console.log('Fixed', file);

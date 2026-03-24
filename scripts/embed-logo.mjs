import { readFileSync, writeFileSync } from 'fs';

const b64 = readFileSync('public/Visual_Crafters_Logo_TransparentBg.png').toString('base64');
const logoDataUri = `data:image/png;base64,${b64}`;

let content = readFileSync('lib/email/templates/requestConfirmation.ts', 'utf8');

// Replace whatever is currently in the src attribute of the logo img tag
content = content.replace(
  /(<img\s[^>]*?src=")[^"]*(")/,
  `$1${logoDataUri}$2`
);

writeFileSync('lib/email/templates/requestConfirmation.ts', content, 'utf8');
console.log('Done. File size:', (content.length / 1024).toFixed(1), 'KB');

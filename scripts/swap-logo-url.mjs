import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('lib/email/templates/requestConfirmation.ts', 'utf8');

// Replace whatever is currently in the logo img src (base64 or any URL)
content = content.replace(
  /(<img\s[^>]*?src=")[^"]*(")/,
  '$1https://res.cloudinary.com/dqvhbvqnw/image/upload/v1774382489/Visual_Crafters_Logo_TransparentBg_mb126b.png$2'
);

writeFileSync('lib/email/templates/requestConfirmation.ts', content, 'utf8');
console.log('Done.');

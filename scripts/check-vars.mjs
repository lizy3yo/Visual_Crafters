import { readFileSync } from 'fs';
const c = readFileSync('lib/email/templates/requestConfirmation.ts', 'utf8');
console.log(c.includes('appUrl') ? 'appUrl present' : 'appUrl clean');
console.log(c.includes('logoUrl') ? 'logoUrl present' : 'logoUrl clean');

import { readFileSync } from 'fs';
const c = readFileSync('lib/email/templates/requestConfirmation.ts', 'utf8');
const m = c.match(/src="([^"]{0,200})"/);
console.log('img src:', m ? m[1] : 'not found');

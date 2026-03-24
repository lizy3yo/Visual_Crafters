import { readFileSync } from 'fs';

const c = readFileSync('lib/email/templates/requestConfirmation.ts', 'utf8');
const match = c.match(/src="(data:image\/png;base64,[^"]+)"/);

if (match) {
  const b64 = match[1].replace('data:image/png;base64,', '');
  const buf = Buffer.from(b64, 'base64');
  const valid = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  console.log('base64 length:', b64.length);
  console.log('PNG magic bytes valid:', valid);
  console.log('Decoded size:', (buf.length / 1024).toFixed(1), 'KB');
} else {
  console.log('FAIL: no base64 src found');
}

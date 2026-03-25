interface StatusUpdateData {
  fullName:       string;
  service:        string;
  templateTitle?: string;
  deadline:       string;
  referenceNumber: string;
  status:         'In Progress' | 'Completed' | 'Cancelled';
}

// Inline SVG icons (Lucide paths) for use in HTML emails
const ICONS = {
  paintbrush: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  info:        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  creditCard:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  phone:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
};

// Cloudinary-hosted logo (same as requestConfirmation.ts)
const LOGO_URL = 'https://res.cloudinary.com/dqvhbvqnw/image/upload/v1774382489/Visual_Crafters_Logo_TransparentBg_mb126b.png';

const STATUS_CONFIG = {
  'In Progress': {
    subject:    'Your Design Request is Now In Progress',
    headerText: "We're Working on It!",
    headerSub:  'Your design request has been accepted and our team is now working on it.',
    accentColor: '#0ea5e9',
    badgeBg:    '#e0f2fe',
    badgeColor: '#0369a1',
    headerIcon: ICONS.paintbrush,
    bodyLines: [
      "Great news! Your design request has been reviewed and accepted by our team.",
      "Our designers are now actively working on your project. We'll keep you updated on the progress.",
    ],
    callout: {
      bg:    '#f0f9ff',
      border: '#bae6fd',
      text:  '#0c4a6e',
      icon:  ICONS.info,
      message: 'Our team will reach out if we need any additional details or clarifications about your project.',
    },
    nextSteps: [
      { step: '1', text: 'Our designers are crafting your design based on your requirements.' },
      { step: '2', text: 'You will receive a notification once your design is ready for review.' },
      { step: '3', text: 'Final delivery will be arranged upon your approval and payment confirmation.' },
    ],
  },
  'Completed': {
    subject:    'Your Design is Ready — Action Required',
    headerText: 'Your Design is Ready!',
    headerSub:  'Your design request has been completed and is ready for pickup.',
    accentColor: '#10b981',
    badgeBg:    '#d1fae5',
    badgeColor: '#065f46',
    headerIcon: ICONS.checkCircle,
    bodyLines: [
      "Exciting news! Your design has been completed and is ready for you.",
      "Please review the details below and proceed with the next steps to claim your design.",
    ],
    callout: {
      bg:    '#f0fdf4',
      border: '#86efac',
      text:  '#14532d',
      icon:  ICONS.creditCard,
      message: 'To receive your final design files, please settle the payment at our office or contact us to arrange an alternative payment method. Once payment is confirmed, your files will be released immediately.',
    },
    nextSteps: [
      { step: '1', text: 'Visit our office or contact us to arrange payment settlement.' },
      { step: '2', text: 'Present your reference number upon arrival for quick processing.' },
      { step: '3', text: 'Receive your final design files immediately after payment confirmation.' },
    ],
  },
  'Cancelled': {
    subject:    'Your Design Request Has Been Cancelled',
    headerText: 'Request Cancelled',
    headerSub:  'Your design request has been cancelled.',
    accentColor: '#ef4444',
    badgeBg:    '#fee2e2',
    badgeColor: '#991b1b',
    headerIcon: ICONS.xCircle,
    bodyLines: [
      "We regret to inform you that your design request has been cancelled.",
      "If you believe this was done in error or would like to discuss further, please don't hesitate to reach out to us.",
    ],
    callout: {
      bg:    '#fef2f2',
      border: '#fca5a5',
      text:  '#7f1d1d',
      icon:  ICONS.phone,
      message: 'If you have any questions about this cancellation or would like to submit a new request, please contact us at visualcraftersolution@gmail.com and we will be happy to assist you.',
    },
    nextSteps: [
      { step: '1', text: 'Contact us if you have questions about this cancellation.' },
      { step: '2', text: 'You are welcome to submit a new request at any time.' },
      { step: '3', text: 'Our team is always ready to help bring your vision to life.' },
    ],
  },
};

export function getRequestStatusUpdateTemplate(
  data: StatusUpdateData
): { html: string; text: string; subject: string } {
  const { fullName, service, templateTitle, deadline, referenceNumber, status } = data;
  const cfg = STATUS_CONFIG[status];

  const formattedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${cfg.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(31,77,184,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2a2fd4 0%,#1a6fd4 55%,#4ab8e8 100%);padding:40px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="Visual Crafters" width="72" height="72"
                   style="display:inline-block;margin-bottom:14px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.25));" />
              <p style="margin:0 0 6px 0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Visual Crafters Solutions</p>
              <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:6px;">${cfg.headerIcon}</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">${cfg.headerText}</h1>
              <p style="margin:10px 0 0 0;color:rgba(255,255,255,0.80);font-size:14px;">${cfg.headerSub}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="margin:0;color:#1b243b;font-size:16px;line-height:1.6;">Hi <strong>${fullName}</strong>,</p>
              ${cfg.bodyLines.map(line => `<p style="margin:12px 0 0 0;color:#4a5475;font-size:15px;line-height:1.7;">${line}</p>`).join('')}
            </td>
          </tr>

          <!-- Reference + Status -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <div style="background-color:#f0f4ff;border:1px solid #d0dcf8;border-radius:8px;padding:14px 18px;box-sizing:border-box;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:50%;">
                      <p style="margin:0;font-size:11px;color:#6b7aaa;text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                      <p style="margin:4px 0 0 0;font-size:16px;font-weight:800;color:#1f4db8;">#${referenceNumber}</p>
                    </td>
                    <td style="width:50%;text-align:right;">
                      <p style="margin:0;font-size:11px;color:#6b7aaa;text-transform:uppercase;letter-spacing:1px;">Status</p>
                      <span style="display:inline-block;margin-top:4px;padding:4px 12px;border-radius:20px;background-color:${cfg.badgeBg};color:${cfg.badgeColor};font-size:12px;font-weight:700;">${status}</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Order details -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#1b243b;text-transform:uppercase;letter-spacing:1px;">Request Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8edf8;border-radius:10px;overflow:hidden;">
                <tr style="background-color:#f7f9ff;">
                  <td style="padding:11px 16px;font-size:12px;color:#6b7aaa;width:40%;">Service</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1b243b;">${service}</td>
                </tr>
                ${templateTitle ? `
                <tr style="border-top:1px solid #e8edf8;">
                  <td style="padding:11px 16px;font-size:12px;color:#6b7aaa;">Template</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1b243b;">${templateTitle}</td>
                </tr>` : ''}
                <tr style="border-top:1px solid #e8edf8;background-color:#f7f9ff;">
                  <td style="padding:11px 16px;font-size:12px;color:#6b7aaa;">Deadline</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1b243b;">${deadline}</td>
                </tr>
                <tr style="border-top:1px solid #e8edf8;">
                  <td style="padding:11px 16px;font-size:12px;color:#6b7aaa;">Updated On</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1b243b;">${formattedDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Callout -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <div style="background-color:${cfg.callout.bg};border-left:4px solid ${cfg.callout.border};padding:14px 16px;border-radius:6px;">
                <p style="margin:0;color:${cfg.callout.text};font-size:14px;line-height:1.6;">
                  <span style="vertical-align:middle;">${cfg.callout.icon}</span>
                  <strong> Note:</strong> ${cfg.callout.message}
                </p>
              </div>
            </td>
          </tr>

          <!-- Next steps -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:#1b243b;text-transform:uppercase;letter-spacing:1px;">Next Steps</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${cfg.nextSteps.map(ns => `
                <tr>
                  <td style="padding:0 0 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:30px;height:30px;background-color:${cfg.accentColor};border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:12px;font-weight:700;">${ns.step}</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#4a5475;line-height:1.5;">${ns.text}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <hr style="border:none;border-top:1px solid #e8edf8;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 32px 32px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#1b243b;">Visual Crafters Solutions</p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#9aa3c2;">Creative designs made simple.</p>
              <p style="margin:0;font-size:11px;color:#b0b8d0;">
                Questions? Contact us at
                <a href="mailto:visualcraftersolution@gmail.com" style="color:#1f4db8;text-decoration:none;">visualcraftersolution@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
Visual Crafters Solutions — ${cfg.headerText}

Hi ${fullName},

${cfg.bodyLines.join('\n')}

Reference Number : #${referenceNumber}
Status           : ${status}
Service          : ${service}
${templateTitle ? `Template         : ${templateTitle}\n` : ''}Deadline         : ${deadline}
Updated On       : ${formattedDate}

NOTE: ${cfg.callout.message}

NEXT STEPS:
${cfg.nextSteps.map(ns => `${ns.step}. ${ns.text}`).join('\n')}

Visual Crafters Solutions
Contact: visualcraftersolution@gmail.com

This is an automated message. Please do not reply.
`;

  return { html, text, subject: cfg.subject };
}

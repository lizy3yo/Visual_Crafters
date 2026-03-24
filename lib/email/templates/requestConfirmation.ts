interface RequestConfirmationData {
  fullName:       string;
  templateTitle:  string;
  templatePrice:  number;
  category:       string;
  deadline:       string;
  description?:   string;
  referenceNumber: string;
}

export function getRequestConfirmationTemplate(
  data: RequestConfirmationData
): { html: string; text: string } {
  const {
    fullName, templateTitle, templatePrice,
    category, deadline, description, referenceNumber,
  } = data;

  const formattedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });


  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Request Confirmation – Visual Crafters</title>
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
              <img src="https://res.cloudinary.com/dqvhbvqnw/image/upload/v1774382489/Visual_Crafters_Logo_TransparentBg_mb126b.png" alt="Visual Crafters" width="80" height="80"
                   style="display:inline-block;margin-bottom:16px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.25));" />
              <p style="margin:0 0 8px 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Visual Crafters Solutions</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Request Confirmed!</h1>
              <p style="margin:10px 0 0 0;color:rgba(255,255,255,0.80);font-size:14px;">We've received your design request and will be in touch soon.</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="margin:0;color:#1b243b;font-size:16px;line-height:1.6;">
                Hi <strong>${fullName}</strong>,
              </p>
              <p style="margin:12px 0 0 0;color:#4a5475;font-size:15px;line-height:1.7;">
                Thank you for choosing Visual Crafters! Your request has been successfully submitted.
                Our team will review it and reach out to you shortly.
              </p>
            </td>
          </tr>

          <!-- Reference number -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <div style="background-color:#f0f4ff;border:1px solid #d0dcf8;border-radius:8px;padding:14px 18px;display:inline-block;width:100%;box-sizing:border-box;">
                <p style="margin:0;font-size:12px;color:#6b7aaa;text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                <p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:#1f4db8;letter-spacing:1px;">#${referenceNumber}</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#9aa3c2;">Submitted on ${formattedDate}</p>
              </div>
            </td>
          </tr>

          <!-- Order summary -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#1b243b;text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #e8edf8;border-radius:10px;overflow:hidden;">
                <tr style="background-color:#f7f9ff;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7aaa;text-transform:uppercase;letter-spacing:0.8px;width:40%;">Item</td>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7aaa;text-transform:uppercase;letter-spacing:0.8px;">Details</td>
                </tr>
                <tr style="border-top:1px solid #e8edf8;">
                  <td style="padding:13px 16px;font-size:13px;color:#6b7aaa;">Template</td>
                  <td style="padding:13px 16px;font-size:13px;font-weight:600;color:#1b243b;">${templateTitle}</td>
                </tr>
                <tr style="border-top:1px solid #e8edf8;background-color:#f7f9ff;">
                  <td style="padding:13px 16px;font-size:13px;color:#6b7aaa;">Category</td>
                  <td style="padding:13px 16px;font-size:13px;font-weight:600;color:#1b243b;">${category}</td>
                </tr>
                <tr style="border-top:1px solid #e8edf8;">
                  <td style="padding:13px 16px;font-size:13px;color:#6b7aaa;">Deadline</td>
                  <td style="padding:13px 16px;font-size:13px;font-weight:600;color:#1b243b;">${deadline}</td>
                </tr>
                <tr style="border-top:1px solid #e8edf8;background-color:#f7f9ff;">
                  <td style="padding:13px 16px;font-size:13px;color:#6b7aaa;">Price</td>
                  <td style="padding:13px 16px;font-size:15px;font-weight:800;color:#1f4db8;">&#8369;${templatePrice.toLocaleString()}</td>
                </tr>
                ${description ? `
                <tr style="border-top:1px solid #e8edf8;">
                  <td style="padding:13px 16px;font-size:13px;color:#6b7aaa;vertical-align:top;">Notes</td>
                  <td style="padding:13px 16px;font-size:13px;color:#4a5475;line-height:1.6;">${description}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#1b243b;text-transform:uppercase;letter-spacing:1px;">What Happens Next?</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background-color:#1f4db8;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:13px;font-weight:700;">1</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#4a5475;line-height:1.5;">Our team reviews your request within <strong style="color:#1b243b;">1–2 business days</strong>.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background-color:#1f4db8;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:13px;font-weight:700;">2</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#4a5475;line-height:1.5;">We'll contact you at this email to <strong style="color:#1b243b;">confirm details and payment</strong>.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background-color:#1f4db8;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:13px;font-weight:700;">3</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#4a5475;line-height:1.5;">Design work begins once payment is confirmed. 🎨</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <hr style="border:none;border-top:1px solid #e8edf8;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1b243b;">Visual Crafters Solutions</p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#9aa3c2;">Creative designs made simple.</p>
              <p style="margin:0;font-size:11px;color:#b0b8d0;">
                This is an automated confirmation. Please do not reply to this email.<br/>
                If you have questions, contact us at
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
Visual Crafters Solutions — Request Confirmed!

Hi ${fullName},

Thank you for choosing Visual Crafters! Your request has been successfully submitted.

Reference Number: #${referenceNumber}
Submitted on: ${formattedDate}

ORDER SUMMARY
─────────────────────────────
Template : ${templateTitle}
Category : ${category}
Deadline : ${deadline}
Price    : ₱${templatePrice.toLocaleString()}
${description ? `Notes    : ${description}` : ''}

WHAT HAPPENS NEXT?
1. Our team reviews your request within 1–2 business days.
2. We'll contact you to confirm details and payment.
3. Design work begins once payment is confirmed.

Visual Crafters Solutions
Creative designs made simple.
Contact: visualcraftersolution@gmail.com

This is an automated message. Please do not reply.
`;

  return { html, text };
}

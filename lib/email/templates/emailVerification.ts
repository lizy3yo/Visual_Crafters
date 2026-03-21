export function getEmailVerificationTemplate(
    firstName: string,
    verificationLink: string,
    expiryHours: number = 24
): {html: string; text: string} {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to CHTM Cooks! 🎉</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi <strong>${firstName}</strong>,
                  </p>
                  
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for registering with CHTM Cooks! We're excited to have you on board.
                  </p>
                  
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    To complete your registration and access all features, please verify your email address by clicking the button below:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${verificationLink}" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="color: #667eea; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px; margin: 10px 0;">
                    ${verificationLink}
                  </p>
                  
                  <!-- Info Box -->
                  <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="color: #0c5460; font-size: 14px; margin: 0; line-height: 1.5;">
                      ℹ️ <strong>Note:</strong> This verification link expires in <strong>${expiryHours} hours</strong>.
                    </p>
                  </div>
                  
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    If you didn't create an account with CHTM Cooks, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="color: #6c757d; font-size: 13px; margin: 0 0 10px 0;">
                    CHTM Cooks - Hotel and Tourism Management
                  </p>
                  <p style="color: #6c757d; font-size: 12px; margin: 0;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Welcome to CHTM Cooks!
    
    Hi ${firstName},
    
    Thank you for registering with CHTM Cooks! We're excited to have you on board.
    
    To complete your registration, please verify your email address by clicking the link below:
    ${verificationLink}
    
    This verification link expires in ${expiryHours} hours.
    
    If you didn't create an account, you can safely ignore this email.
    
    CHTM Cooks - Hotel and Tourism Management
  `;

  return { html, text };
}
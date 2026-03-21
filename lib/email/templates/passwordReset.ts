export function getPasswordResetEmailTemplate(
    firstName: string,
    resetLink: string,
    expiryMinutes: number = 30
): { html: string; text: string } {
      const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi <strong>${firstName}</strong>,
                  </p>
                  
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    We received a request to reset your password for your CHTM Cooks account. Click the button below to create a new password:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetLink}" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="color: #667eea; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px; margin: 10px 0;">
                    ${resetLink}
                  </p>
                  
                  <!-- Warning Box -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                      ⚠️ <strong>Important:</strong> This link expires in <strong>${expiryMinutes} minutes</strong> and can only be used once.
                    </p>
                  </div>
                  
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
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
    Reset Your Password
    
    Hi ${firstName},
    
    We received a request to reset your password for your CHTM Cooks account.
    
    Click the link below to create a new password:
    ${resetLink}
    
    This link expires in ${expiryMinutes} minutes and can only be used once.
    
    If you didn't request a password reset, please ignore this email.
    
    CHTM Cooks - Hotel and Tourism Management
  `;

  return { html, text };
}

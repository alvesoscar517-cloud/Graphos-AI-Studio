/**
 * Welcome Email Template Generator
 * Generates localized welcome emails for new user registrations
 * Uses CID (Content-ID) for embedded images
 */

const { cidSrc, cidIcon, cidLogo } = require('../utils/emailCid');

// App URLs
const APP_URL = process.env.APP_URL || 'https://app.graphosai.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'Support@graphosai.com';

/**
 * Generate welcome email HTML
 * @param {Object} options - Email options
 * @param {string} options.userName - User's display name
 * @param {string} options.lang - Language code (en, vi, zh, ja, ko, es, fr, de, it, pt, ru, ar, th, id, ms)
 * @param {Object} options.translations - Translation object with welcome_email keys
 * @returns {Object} - { subject, html }
 */
function generateWelcomeEmail({ userName, lang = 'en', translations }) {
  const t = translations.welcome_email || {};
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const paddingDir = isRTL ? 'left' : 'right';

  const subject = t.subject || 'Welcome to Graphos AI Studio';

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 50%,#1a1a1a 100%);padding:56px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <img src="${cidSrc('logo')}" alt="Graphos AI Studio" width="64" height="64" style="display:block;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.3);"/>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;line-height:1.3;">${t.greeting || 'Welcome aboard'}, ${userName}</h1>
                    <div style="width:60px;height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;margin:20px auto 0;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:${textAlign};">
              <p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">${t.intro || 'Thank you for joining Graphos AI Studio. We are excited to have you as part of our community of writers and creators.'}</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 40px 40px;">
              <a href="${APP_URL}" style="display:inline-block;padding:16px 40px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">${t.get_started || 'Get Started'}</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);"></div>
            </td>
          </tr>

          <!-- Features Section -->
          <tr>
            <td style="padding:40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Feature 1 -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="56" style="vertical-align:top;padding-${paddingDir}:16px;">
                          <div style="width:48px;height:48px;background-color:#f3f4f6;border-radius:12px;text-align:center;line-height:48px;">
                            <img src="${cidSrc('check', 'black')}" alt="" width="24" height="24" style="display:inline-block;vertical-align:middle;"/>
                          </div>
                        </td>
                        <td style="vertical-align:top;text-align:${textAlign};">
                          <h3 style="margin:0 0 6px;color:#1a1a1a;font-size:15px;font-weight:600;">${t.feature1_title || 'AI Detection'}</h3>
                          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">${t.feature1_desc || 'Analyze your text to detect AI-generated content with high accuracy.'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Feature 2 -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="56" style="vertical-align:top;padding-${paddingDir}:16px;">
                          <div style="width:48px;height:48px;background-color:#f3f4f6;border-radius:12px;text-align:center;line-height:48px;">
                            <img src="${cidSrc('user', 'black')}" alt="" width="24" height="24" style="display:inline-block;vertical-align:middle;"/>
                          </div>
                        </td>
                        <td style="vertical-align:top;text-align:${textAlign};">
                          <h3 style="margin:0 0 6px;color:#1a1a1a;font-size:15px;font-weight:600;">${t.feature2_title || 'Voice Profiles'}</h3>
                          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">${t.feature2_desc || 'Create unique voice profiles to maintain your authentic writing style.'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Feature 3 -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="56" style="vertical-align:top;padding-${paddingDir}:16px;">
                          <div style="width:48px;height:48px;background-color:#f3f4f6;border-radius:12px;text-align:center;line-height:48px;">
                            <img src="${cidSrc('file', 'black')}" alt="" width="24" height="24" style="display:inline-block;vertical-align:middle;"/>
                          </div>
                        </td>
                        <td style="vertical-align:top;text-align:${textAlign};">
                          <h3 style="margin:0 0 6px;color:#1a1a1a;font-size:15px;font-weight:600;">${t.feature3_title || 'Text Humanization'}</h3>
                          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">${t.feature3_desc || 'Transform AI-generated text into natural, human-like content.'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding:0 40px 40px;">
              <div style="background-color:#f3f4f6;border-radius:12px;padding:24px;text-align:${textAlign};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-${paddingDir}:12px;vertical-align:top;">
                            <img src="${cidSrc('info', 'black')}" alt="" width="20" height="20" style="display:block;"/>
                          </td>
                          <td>
                            <h4 style="margin:0 0 8px;color:#1a1a1a;font-size:14px;font-weight:600;">${t.help_title || 'Need Help?'}</h4>
                            <p style="margin:0 0 16px;color:#6b7280;font-size:13px;line-height:1.5;">${t.help_desc || 'Our support team is here to assist you. Feel free to reach out anytime.'}</p>
                            <a href="mailto:${SUPPORT_EMAIL}" style="display:inline-block;padding:10px 20px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;border-radius:8px;">${t.contact_support || 'Contact Support'}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <img src="${cidSrc('logo')}" alt="Graphos AI Studio" width="32" height="32" style="display:block;border-radius:8px;margin:0 auto;"/>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.5;">${t.footer || 'This email was sent because you created an account on Graphos AI Studio.'}</p>
                    <p style="margin:0;color:#9ca3af;font-size:11px;">2025 ${t.copyright || 'Graphos AI Studio. All rights reserved.'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

module.exports = { generateWelcomeEmail };

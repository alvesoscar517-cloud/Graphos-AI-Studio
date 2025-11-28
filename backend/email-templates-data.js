// Email Templates Data for Preview
// Uses PNG icons from /public/icons/ folder

// Icon file mapping
const ICON_FILES = {
  check: 'circle-check',
  message: 'message-square',
  mail: 'mail',
  creditCard: 'credit-card',
  file: 'file-text',
  database: 'database',
  download: 'download',
  barChart: 'chart-bar',
  info: 'info',
  user: 'user',
  calendar: 'calendar',
  alertCircle: 'circle-alert'
};

// Base path for icons (relative to HTML file location)
const ICON_BASE = 'public/icons';

function getIconUrl(name, color = 'black') {
  const fileName = ICON_FILES[name] || name;
  return `${ICON_BASE}/${fileName}-${color}.png`;
}

function getIcon(name, color = 'black', size = 24) {
  const url = getIconUrl(name, color);
  return `<img src="${url}" alt="${name}" width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;"/>`;
}

function getAppLogo(size = 40) {
  return `<img src="${ICON_BASE}/content.png" alt="AI Content Authenticator" width="${size}" height="${size}" style="display:block;border-radius:8px;"/>`;
}


// Support Reply Template
const supportReplyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Reply</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:48px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <div style="width:72px;height:72px;background-color:rgba(255,255,255,0.15);border-radius:50%;display:inline-block;text-align:center;line-height:72px;">
                      ${getIcon('message', 'white', 32)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;letter-spacing:-0.5px;line-height:1.3;">We've Responded to Your Feedback</h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Ticket #ABC12345</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#1a1a1a;font-size:16px;">${getIcon('user', 'black', 18)} Hi <strong>John Doe</strong>,</p>
              <p style="margin:0 0 30px;color:#666666;font-size:15px;line-height:1.6;">Thank you for reaching out. Our team has reviewed your request and provided a response below.</p>
              <!-- Original Request -->
              <div style="background-color:#fafafa;border-radius:8px;padding:20px;margin-bottom:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom:8px;"><span style="color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('file', 'black', 16)}</span>Your Original Request</span></td></tr>
                  <tr><td><p style="margin:0;color:#333333;font-size:15px;line-height:1.6;">I'm having trouble with my subscription renewal. The payment keeps failing.</p></td></tr>
                </table>
              </div>
              <!-- Response -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('mail', 'black', 14)}</span>Our Response</p>
                <div style="padding:20px;background-color:#1a1a1a;border-radius:8px;">
                  <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.7;white-space:pre-wrap;">Hi John,

Thank you for contacting us about your subscription renewal issue.

We've checked your account and found that your card on file has expired. Please update your payment method in Settings > Billing to resolve this issue.

If you continue to experience problems, please let us know and we'll be happy to assist further.</p>
                </div>
              </div>
              <div style="height:1px;background-color:#e5e5e5;margin:24px 0;"></div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="26" style="vertical-align:top;padding-top:3px;"><img src="public/icons/info-black.png" alt="info" width="16" height="16" style="display:block;"/></td>
                  <td style="color:#666666;font-size:14px;line-height:1.6;">If you have any further questions, please don't hesitate to reply to this email.</td>
                </tr>
              </table>
              <div style="margin-top:30px;">
                <p style="margin:0 0 4px;color:#1a1a1a;font-size:15px;font-weight:600;">Best regards,</p>
                <p style="margin:0;color:#666666;font-size:15px;">AI Content Authenticator Support Team</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:16px;">${getAppLogo(32)}</td></tr>
                <tr><td align="center"><p style="margin:0 0 8px;color:#666666;font-size:13px;line-height:1.5;">This email was sent in response to your support ticket</p><p style="margin:0;color:#999999;font-size:12px;">© 2025 AI Content Authenticator. All rights reserved.</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


// New Ticket Template (Admin)
const newTicketTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Ticket</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:48px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <div style="width:72px;height:72px;background-color:rgba(255,255,255,0.15);border-radius:50%;display:inline-block;text-align:center;line-height:72px;">
                      ${getIcon('creditCard', 'white', 32)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;letter-spacing:-0.5px;line-height:1.3;">New Support Request</h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Ticket #XYZ98765</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <!-- Ticket Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td style="padding:20px;background-color:#fafafa;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('user', 'black', 14)}</span>From</span>
                          <p style="margin:4px 0 0;color:#1a1a1a;font-size:15px;font-weight:500;">Jane Smith</p>
                          <p style="margin:2px 0 0;color:#666666;font-size:14px;"><a href="mailto:jane@example.com" style="color:#666666;text-decoration:none;">jane@example.com</a></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e5e5;">
                          <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('calendar', 'black', 14)}</span>Date</span>
                          <p style="margin:4px 0 0;color:#1a1a1a;font-size:14px;">Nov 29, 2025, 10:30 AM</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e5e5;">
                          <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('alertCircle', 'black', 14)}</span>Priority</span>
                          <p style="margin:4px 0 0;"><span style="display:inline-block;padding:4px 12px;background-color:#1a1a1a;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-radius:12px;">HIGH</span></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e5e5;">
                          <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Category</span>
                          <p style="margin:4px 0 0;color:#1a1a1a;font-size:14px;font-weight:500;">Billing</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Title -->
              <div style="margin-bottom:24px;">
                <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;font-weight:600;letter-spacing:-0.3px;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('file', 'black', 20)}</span>Payment failed for subscription renewal</h2>
              </div>
              <!-- Content -->
              <div style="margin-bottom:30px;">
                <div style="padding:20px;background-color:#fafafa;border-radius:8px;border:1px solid #e5e5e5;">
                  <p style="margin:0;color:#333333;font-size:15px;line-height:1.6;white-space:pre-wrap;">Hello,

I've been trying to renew my Pro subscription but the payment keeps failing. I've tried multiple cards but none of them work.

My account email is jane@example.com and I've been a customer since 2023.

Please help me resolve this issue as soon as possible.

Thanks,
Jane</p>
                </div>
              </div>
              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="#" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px;border-radius:8px;text-transform:uppercase;">View in Admin Panel</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:16px;">${getAppLogo(32)}</td></tr>
                <tr><td align="center"><p style="margin:0 0 8px;color:#666666;font-size:13px;line-height:1.5;">This is an automated notification from AI Content Authenticator Support System</p><p style="margin:0;color:#999999;font-size:12px;">© 2025 AI Content Authenticator. All rights reserved.</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


// Backup Completed Template
const backupTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backup Completed</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:48px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <div style="width:72px;height:72px;background-color:rgba(255,255,255,0.15);border-radius:50%;display:inline-block;text-align:center;line-height:72px;">
                      ${getIcon('check', 'white', 32)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;letter-spacing:-0.5px;line-height:1.3;">Backup Completed</h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Friday, November 29, 2025 at 3:00 PM</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <!-- File Info -->
              <div style="background-color:#fafafa;border-radius:8px;padding:20px;margin-bottom:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom:8px;"><span style="color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('file', 'black', 16)}</span>File</span></td></tr>
                  <tr><td><p style="margin:0;color:#333333;font-size:15px;line-height:1.6;"><code style="font-family:'Courier New',monospace;font-size:13px;background:#e5e5e5;padding:2px 6px;border-radius:8px;">firestore-backup-2025-11-29T15-00-00.json</code></p></td></tr>
                </table>
              </div>
              <!-- Bucket Info -->
              <div style="background-color:#fafafa;border-radius:8px;padding:20px;margin-bottom:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom:8px;"><span style="color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('database', 'black', 16)}</span>Bucket</span></td></tr>
                  <tr><td><p style="margin:0;color:#333333;font-size:15px;line-height:1.6;"><code style="font-family:'Courier New',monospace;font-size:13px;background:#e5e5e5;padding:2px 6px;border-radius:8px;">AI Content Authenticator-firestore-backups</code></p></td></tr>
                </table>
              </div>
              <!-- Statistics -->
              <h3 style="margin:24px 0 16px;color:#1a1a1a;font-size:16px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('barChart', 'black', 18)}</span>Backup Statistics</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;"><span style="color:#374151;font-size:14px;">users</span></td><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="color:#1a1a1a;font-weight:600;font-size:14px;">1,234</span><span style="color:#666666;font-size:13px;margin-left:4px;">docs</span></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;"><span style="color:#374151;font-size:14px;">notifications</span></td><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="color:#1a1a1a;font-weight:600;font-size:14px;">5,678</span><span style="color:#666666;font-size:13px;margin-left:4px;">docs</span></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;"><span style="color:#374151;font-size:14px;">support_tickets</span></td><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="color:#1a1a1a;font-weight:600;font-size:14px;">89</span><span style="color:#666666;font-size:13px;margin-left:4px;">docs</span></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;"><span style="color:#374151;font-size:14px;">voice_profiles</span></td><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="color:#1a1a1a;font-weight:600;font-size:14px;">456</span><span style="color:#666666;font-size:13px;margin-left:4px;">docs</span></td></tr>
              </table>
              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="#" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px;border-radius:8px;text-transform:uppercase;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('download', 'white', 18)}</span>Download Backup</a>
                  </td>
                </tr>
              </table>
              <!-- Info Box -->
              <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin-top:24px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="26" style="vertical-align:top;padding-top:2px;"><img src="public/icons/info-black.png" alt="info" width="16" height="16" style="display:block;"/></td>
                    <td style="color:#0369a1;font-size:13px;line-height:1.6;"><strong>Public URL</strong> - This link never expires. Save it to your personal Google Drive for safekeeping.</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:16px;">${getAppLogo(32)}</td></tr>
                <tr><td align="center"><p style="margin:0 0 8px;color:#666666;font-size:13px;line-height:1.5;">AI Content Authenticator - Automated Backup System</p><p style="margin:0;color:#999999;font-size:12px;">© 2025 AI Content Authenticator. All rights reserved.</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Template mapping
const templates = {
  'support-reply': supportReplyTemplate,
  'new-ticket': newTicketTemplate,
  'backup': backupTemplate
};

let currentTemplate = 'support-reply';

function showTemplate(name) {
  currentTemplate = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  updateIframes();
}

function toggleDevice(device) {
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  const desktop = document.getElementById('desktop-frame');
  const mobile = document.getElementById('mobile-frame');
  
  if (device === 'both') {
    desktop.classList.remove('hidden');
    mobile.classList.remove('hidden');
  } else if (device === 'desktop') {
    desktop.classList.remove('hidden');
    mobile.classList.add('hidden');
  } else {
    desktop.classList.add('hidden');
    mobile.classList.remove('hidden');
  }
}

function updateIframes() {
  const html = templates[currentTemplate];
  document.getElementById('desktop-iframe').srcdoc = html;
  document.getElementById('mobile-iframe').srcdoc = html;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', updateIframes);

/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const config = require('../config');

// Feedback endpoint
router.post('/send-feedback', async (req, res) => {
  try {
    const { type, category, priority, title, content, images, userEmail, userName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { db } = require('../config/firebase');
    const { v4: uuidv4 } = require('uuid');

    const isBillingSupport = type === 'billing_support';
    const messageType = isBillingSupport ? 'billing_support' : 'feedback';
    
    console.log(`[INFO] Saving ${messageType} from ${userName} (${userEmail})...`);

    // Save to Firestore
    const ticketId = uuidv4();
    const now = new Date();
    
    const ticketData = {
      type: messageType,
      category: category || 'general',
      priority: priority || 'medium',
      title,
      content,
      images: images || [],
      userEmail,
      userName,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      replies: []
    };

    await db.collection('support_tickets').doc(ticketId).set(ticketData);
    console.log(`[SUCCESS] Ticket ${ticketId} saved to Firestore`);

    // Send email notification to admin
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 40px 30px; text-align: center;">
                      <div style="background-color: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          ${isBillingSupport ? `
                          <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1a1a1a" stroke-width="2"/>
                          <path d="M2 10h20" stroke="#1a1a1a" stroke-width="2"/>
                          <path d="M7 15h3" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                          ` : `
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <polyline points="14 2 14 8 20 8" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                          <line x1="10" y1="9" x2="8" y2="9" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                          `}
                        </svg>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                        New ${isBillingSupport ? 'Support Request' : 'Feedback'}
                      </h1>
                      <p style="margin: 10px 0 0; color: #cccccc; font-size: 14px;">
                        Ticket #${ticketId.substring(0, 8).toUpperCase()}
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Ticket Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #fafafa; border-left: 4px solid #000000; border-radius: 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">From</span>
                                  <p style="margin: 4px 0 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">
                                    ${userName}
                                  </p>
                                  <p style="margin: 2px 0 0; color: #666666; font-size: 14px;">
                                    <a href="mailto:${userEmail}" style="color: #666666; text-decoration: none;">${userEmail}</a>
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e5e5;">
                                  <span style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Date</span>
                                  <p style="margin: 4px 0 0; color: #1a1a1a; font-size: 14px;">
                                    ${now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </p>
                                </td>
                              </tr>
                              ${priority ? `
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e5e5;">
                                  <span style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Priority</span>
                                  <p style="margin: 4px 0 0;">
                                    <span style="display: inline-block; padding: 4px 12px; background-color: ${priority === 'high' || priority === 'urgent' ? '#1a1a1a' : '#666666'}; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 12px;">
                                      ${priority}
                                    </span>
                                  </p>
                                </td>
                              </tr>
                              ` : ''}
                              ${category ? `
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e5e5;">
                                  <span style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Category</span>
                                  <p style="margin: 4px 0 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">
                                    ${category}
                                  </p>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Title -->
                      <div style="margin-bottom: 24px;">
                        <h2 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px; font-weight: 600; letter-spacing: -0.3px;">
                          ${title}
                        </h2>
                      </div>

                      <!-- Content -->
                      <div style="margin-bottom: 30px;">
                        <div style="padding: 20px; background-color: #fafafa; border-radius: 4px; border: 1px solid #e5e5e5;">
                          <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
                        </div>
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${config.ADMIN_PANEL_URL}/support/${ticketId}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.3px; border-radius: 6px; text-transform: uppercase;">
                              View in Admin Panel
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        This is an automated notification from LocalizeAI Support System
                      </p>
                      <p style="margin: 8px 0 0; color: #cccccc; font-size: 12px;">
                        © ${new Date().getFullYear()} LocalizeAI. All rights reserved.
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

      const attachments = [];
      if (images && images.length > 0) {
        images.forEach((imageData, index) => {
          const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            attachments.push({
              filename: `image-${index + 1}.png`,
              content: matches[2],
              encoding: 'base64'
            });
          }
        });
      }

      const subjectPrefix = isBillingSupport ? `[${priority?.toUpperCase() || 'SUPPORT'}]` : '[Feedback]';
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
        to: 'alvesoscar517@gmail.com',
        subject: `${subjectPrefix} ${title} - #${ticketId.substring(0, 8)}`,
        html: htmlContent,
        attachments,
        priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal'
      });

      console.log(`[SUCCESS] Email notification sent to admin`);
    } catch (emailError) {
      console.error('[WARNING] Email notification failed:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      ticketId,
      message: isBillingSupport ? 'Support request sent successfully' : 'Feedback sent successfully'
    });

  } catch (error) {
    console.error('[ERROR] Send feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to send feedback',
      details: error.message 
    });
  }
});

module.exports = router;

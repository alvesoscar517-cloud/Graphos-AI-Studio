/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const envConfig = require('../config/envConfigHelper');
const { createLocalizer } = require('../utils/localized-messages.util');
const { optionalAuth } = require('../middleware/auth.middleware');

// Feedback endpoint - uses optionalAuth middleware for consistent token handling
router.post('/send-feedback', optionalAuth, async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { type, category, priority, title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const { db } = require('../config/firebase');
    const { v4: uuidv4 } = require('uuid');

    // Get user info from middleware (already verified)
    // optionalAuth sets req.user and req.userId if token is valid
    const userId = req.userId || null;
    const userEmail = req.user?.email || 'anonymous@user.com';
    const userName = req.user?.name || 'Anonymous User';
    
    if (req.user) {
      console.log('[INFO] Authenticated user:', { userId, email: userEmail, name: userName, authMethod: req.authMethod });
    } else {
      console.log('[INFO] Anonymous user (no valid token provided)');
    }

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
      userId: userId || null,  // Store userId for future reference
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
      const { newTicketEmail } = require('../services/emailTemplate.service');
      
      // Use SMTP config from Firestore > config > defaults
      const smtpHost = envConfig.get('SMTP_HOST') || config.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = envConfig.get('SMTP_PORT') || config.SMTP_PORT || 587;
      const smtpUser = envConfig.get('SMTP_USER') || config.SMTP_USER || '';
      const smtpPass = envConfig.get('SMTP_PASS') || config.SMTP_PASS || '';
      
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const htmlContent = newTicketEmail({
        ticketId,
        ticketType: messageType,
        userName,
        userEmail,
        title,
        content,
        priority: priority || 'medium',
        category: category || 'general',
        adminPanelUrl: config.ADMIN_PANEL_URL || 'https://admin.graphosai.com'
      });

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

      const subjectPrefix = isBillingSupport ? '[Billing Support]' : '[Feedback]';
      // Use no-reply for system notifications, not SMTP_USER (admin email)
      const fromEmail = envConfig.get('EMAIL_FROM') || config.EMAIL_FROM || 'no-reply@graphosai.com';
      const fromName = envConfig.get('EMAIL_FROM_NAME') || config.EMAIL_FROM_NAME || 'Graphos AI Studio';
      
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: smtpUser, // Send to SMTP_USER (admin email)
        subject: `${subjectPrefix} ${title} - #${ticketId.substring(0, 8)}`,
        html: htmlContent,
        attachments,
        priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal'
      });

      console.log(`[SUCCESS] Email notification sent to admin: ${smtpUser}`);
    } catch (emailError) {
      console.error('[WARNING] Email notification failed:', emailError.message);
      // Continue even if email fails - ticket is already saved
    }

    res.json({
      success: true,
      ticketId,
      message: l.t('support.ticket_created')
    });

  } catch (error) {
    console.error('[ERROR] Send feedback error:', error);
    res.status(500).json({ 
      success: false,
      ...l.error('server_error'),
      details: error.message 
    });
  }
});

module.exports = router;

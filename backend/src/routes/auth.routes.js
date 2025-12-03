/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const { createLocalizer } = require('../utils/localized-messages.util');

// Feedback endpoint
router.post('/send-feedback', async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { type, category, priority, title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const { db } = require('../config/firebase');
    const { v4: uuidv4 } = require('uuid');

    // Get user info from auth token (Firestore)
    let userEmail = 'anonymous@user.com';
    let userName = 'Anonymous User';
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode token to get userId
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        const userId = decoded?.userId || decoded?.sub;
        
        if (userId) {
          // Fetch user from Firestore
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userEmail = userData.email || userEmail;
            userName = userData.displayName || userData.name || userName;
          }
        }
      } catch (tokenError) {
        console.log('[INFO] Could not decode token, using anonymous user');
      }
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
      
      // Use SMTP config
      const smtpHost = config.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = config.SMTP_PORT || process.env.SMTP_PORT || 587;
      const smtpUser = config.SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
      const smtpPass = config.SMTP_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
      
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
      const fromEmail = config.EMAIL_FROM || process.env.EMAIL_FROM || smtpUser;
      const fromName = config.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Graphos AI Studio';
      
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

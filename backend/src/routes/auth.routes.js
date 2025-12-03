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
    const { type, category, priority, title, content, images, userEmail, userName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
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
      const { newTicketEmail } = require('../services/emailTemplate.service');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const htmlContent = newTicketEmail({
        ticketId,
        ticketType: messageType,
        userName,
        userEmail,
        title,
        content,
        priority,
        category,
        adminPanelUrl: config.ADMIN_PANEL_URL
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

      const subjectPrefix = isBillingSupport ? `[${priority?.toUpperCase() || 'SUPPORT'}]` : '[Feedback]';
      const fromEmail = config.EMAIL_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER;
      const fromName = config.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Graphos AI Studio';
      const adminEmail = config.SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
      
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
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

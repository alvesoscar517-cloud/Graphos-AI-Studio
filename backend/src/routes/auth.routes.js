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
    
    console.log(`📝 Saving ${messageType} from ${userName} (${userEmail})...`);

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
    console.log(`✅ Ticket ${ticketId} saved to Firestore`);

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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎫 New ${isBillingSupport ? 'Billing Support' : 'Feedback'} Ticket</h2>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          <p><strong>Date:</strong> ${now.toLocaleString('vi-VN')}</p>
          ${priority ? `<p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? 'red' : 'orange'};">${priority.toUpperCase()}</span></p>` : ''}
          ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
          <h3>Title</h3>
          <p>${title}</p>
          <h3>Content</h3>
          <p>${content.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><a href="${config.ADMIN_PANEL_URL}/support/${ticketId}" style="background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
        </div>
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

      console.log(`✅ Email notification sent to admin`);
    } catch (emailError) {
      console.error('⚠️ Email notification failed:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      ticketId,
      message: isBillingSupport ? 'Support request sent successfully' : 'Feedback sent successfully'
    });

  } catch (error) {
    console.error('❌ Send feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to send feedback',
      details: error.message 
    });
  }
});

module.exports = router;

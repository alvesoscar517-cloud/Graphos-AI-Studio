/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();

// Feedback endpoint
router.post('/send-feedback', async (req, res) => {
  try {
    const { type, category, priority, title, content, images, userEmail, userName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const isBillingSupport = type === 'billing_support';
    const messageType = isBillingSupport ? 'Billing Support Request' : 'Feedback';
    
    console.log(`📧 Sending ${messageType} from ${userName} (${userEmail})...`);

    // Build email HTML (simplified)
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${messageType}</h2>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        ${priority ? `<p><strong>Priority:</strong> ${priority}</p>` : ''}
        ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
        <h3>Title</h3>
        <p>${title}</p>
        <h3>Content</h3>
        <p>${content.replace(/\n/g, '<br>')}</p>
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
      to: 'localizeAI.care@gmail.com',
      subject: `${subjectPrefix} ${title}`,
      html: htmlContent,
      attachments,
      priority: priority === 'urgent' ? 'high' : 'normal'
    });

    console.log(`✅ ${messageType} email sent successfully`);

    res.json({
      success: true,
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

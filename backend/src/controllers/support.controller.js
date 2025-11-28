/**
 * Support Controller
 * Handles feedback and billing support tickets
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

// Get all tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    
    let query = db.collection('support_tickets').orderBy('createdAt', 'desc');
    
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString()
    }));
    
    res.json({ success: true, tickets, count: tickets.length });
  } catch (error) {
    console.error('[ERROR] Get tickets error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticketDoc = await db.collection('support_tickets').doc(id).get();
    
    if (!ticketDoc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const ticket = {
      id: ticketDoc.id,
      ...ticketDoc.data(),
      createdAt: ticketDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: ticketDoc.data().updatedAt?.toDate().toISOString(),
      replies: ticketDoc.data().replies?.map(reply => ({
        ...reply,
        timestamp: reply.timestamp?.toDate().toISOString()
      })) || []
    };
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('[ERROR] Get ticket error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await db.collection('support_tickets').doc(id).update({
      status,
      updatedAt: new Date()
    });
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('[ERROR] Update status error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Reply to ticket
exports.replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sendEmail, sendNotification } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const ticketDoc = await db.collection('support_tickets').doc(id).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const ticket = ticketDoc.data();
    const now = new Date();
    
    const reply = {
      id: uuidv4(),
      message,
      from: 'admin',
      timestamp: now
    };
    
    // Update ticket with reply
    const replies = ticket.replies || [];
    replies.push(reply);
    
    await db.collection('support_tickets').doc(id).update({
      replies,
      status: 'in_progress',
      updatedAt: now
    });
    
    // Send email if requested
    if (sendEmail) {
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
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="9" y1="10" x2="15" y2="10" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                            <line x1="9" y1="14" x2="13" y2="14" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                          We've Responded to Your ${ticket.type === 'billing_support' ? 'Support Request' : 'Feedback'}
                        </h1>
                        <p style="margin: 10px 0 0; color: #cccccc; font-size: 14px;">
                          Ticket #${id.substring(0, 8).toUpperCase()}
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        
                        <!-- Greeting -->
                        <p style="margin: 0 0 24px; color: #1a1a1a; font-size: 16px;">
                          Hi <strong>${ticket.userName}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                          Thank you for reaching out. Our team has reviewed your request and provided a response below.
                        </p>

                        <!-- Original Request -->
                        <div style="margin-bottom: 24px;">
                          <p style="margin: 0 0 8px; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Your Original Request
                          </p>
                          <div style="padding: 16px 20px; background-color: #fafafa; border-left: 4px solid #e5e5e5; border-radius: 4px;">
                            <p style="margin: 0; color: #333333; font-size: 15px; font-weight: 500;">
                              ${ticket.title}
                            </p>
                          </div>
                        </div>

                        <!-- Response -->
                        <div style="margin-bottom: 30px;">
                          <p style="margin: 0 0 8px; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Our Response
                          </p>
                          <div style="padding: 20px; background-color: #1a1a1a; border-radius: 6px;">
                            <p style="margin: 0; color: #ffffff; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                          </div>
                        </div>

                        <!-- Divider -->
                        <div style="height: 1px; background-color: #e5e5e5; margin: 30px 0;"></div>

                        <!-- Additional Info -->
                        <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                          If you have any further questions or need additional assistance, please don't hesitate to reply to this email. We're here to help!
                        </p>

                        <!-- Signature -->
                        <div style="margin-top: 30px;">
                          <p style="margin: 0 0 4px; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                            Best regards,
                          </p>
                          <p style="margin: 0; color: #666666; font-size: 15px;">
                            LocalizeAI Support Team
                          </p>
                        </div>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; text-align: center;">
                        <p style="margin: 0 0 8px; color: #999999; font-size: 13px; line-height: 1.6;">
                          This email was sent in response to your support ticket
                        </p>
                        <p style="margin: 0; color: #cccccc; font-size: 12px;">
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
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
          to: ticket.userEmail,
          subject: `Re: ${ticket.title} - #${id.substring(0, 8)}`,
          html: htmlContent
        });
        
        console.log(`[SUCCESS] Email sent to ${ticket.userEmail}`);
      } catch (emailError) {
        console.error('[WARNING] Email send failed:', emailError);
      }
    }
    
    // Send in-app notification if requested
    if (sendNotification) {
      try {
        // Find user by email
        const usersSnapshot = await db.collection('users')
          .where('email', '==', ticket.userEmail)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userId = usersSnapshot.docs[0].id;
          const notificationId = uuidv4();
          const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
          
          const notificationTitle = ticket.type === 'billing_support' 
            ? 'Phản hồi yêu cầu hỗ trợ thanh toán' 
            : 'Phản hồi feedback của bạn';
          const notificationTitleEn = ticket.type === 'billing_support'
            ? 'Response to your billing support request'
            : 'Response to your feedback';
          
          await db.collection('user_notifications').doc(notificationId).set({
            userId,
            notificationId: null,
            type: 'info',
            priority: 'high',
            translations: {
              vi: {
                title: notificationTitle,
                message: `Chúng tôi đã phản hồi "${ticket.title}":\n\n${message}`,
                cta: 'Xem chi tiết'
              },
              en: {
                title: notificationTitleEn,
                message: `We have responded to "${ticket.title}":\n\n${message}`,
                cta: 'View Details'
              }
            },
            ctaAction: { type: 'view', action: 'support' },
            expiresAt,
            read: false,
            clicked: false,
            autoGenerated: true,
            createdAt: now
          });
          
          console.log(`[SUCCESS] Notification sent to user ${userId}`);
        } else {
          console.log(`[WARNING] User not found with email: ${ticket.userEmail}`);
        }
      } catch (notifError) {
        console.error('[WARNING] Notification send failed:', notifError);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Reply sent successfully',
      reply
    });
  } catch (error) {
    console.error('[ERROR] Reply error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.collection('support_tickets').doc(id).delete();
    
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('[ERROR] Delete ticket error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const [allTickets, openTickets, feedbackTickets, billingTickets] = await Promise.all([
      db.collection('support_tickets').count().get(),
      db.collection('support_tickets').where('status', '==', 'open').count().get(),
      db.collection('support_tickets').where('type', '==', 'feedback').count().get(),
      db.collection('support_tickets').where('type', '==', 'billing_support').count().get()
    ]);
    
    res.json({
      success: true,
      statistics: {
        total: allTickets.data().count,
        open: openTickets.data().count,
        feedback: feedbackTickets.data().count,
        billing: billingTickets.data().count
      }
    });
  } catch (error) {
    console.error('[ERROR] Get statistics error:', error);
    res.status(500).json({ error: String(error) });
  }
};

module.exports = exports;

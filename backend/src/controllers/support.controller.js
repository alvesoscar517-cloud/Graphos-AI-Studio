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
    console.error('❌ Get tickets error:', error);
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
    console.error('❌ Get ticket error:', error);
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
    console.error('❌ Update status error:', error);
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📬 Response to your ${ticket.type === 'billing_support' ? 'Support Request' : 'Feedback'}</h2>
            <p>Hi ${ticket.userName},</p>
            <p>We have responded to your ticket:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Original Request:</strong> ${ticket.title}</p>
            </div>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Our Response:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>If you have any further questions, please reply to this email.</p>
            <p>Best regards,<br>LocalizeAI Support Team</p>
          </div>
        `;
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'alvesoscar517@gmail.com',
          to: ticket.userEmail,
          subject: `Re: ${ticket.title} - #${id.substring(0, 8)}`,
          html: htmlContent
        });
        
        console.log(`✅ Email sent to ${ticket.userEmail}`);
      } catch (emailError) {
        console.error('⚠️ Email send failed:', emailError);
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
          
          await db.collection('user_notifications').doc(notificationId).set({
            userId,
            notificationId: null,
            type: 'info',
            priority: 'high',
            translations: {
              vi: `Phản hồi cho: ${ticket.title}\n\n${message}`,
              en: `Response to: ${ticket.title}\n\n${message}`
            },
            read: false,
            clicked: false,
            createdAt: now
          });
          
          console.log(`✅ Notification sent to user ${userId}`);
        }
      } catch (notifError) {
        console.error('⚠️ Notification send failed:', notifError);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Reply sent successfully',
      reply
    });
  } catch (error) {
    console.error('❌ Reply error:', error);
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
    console.error('❌ Delete ticket error:', error);
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
    console.error('❌ Get statistics error:', error);
    res.status(500).json({ error: String(error) });
  }
};

module.exports = exports;

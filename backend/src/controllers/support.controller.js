/**
 * Support Controller
 * Handles feedback and billing support tickets
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');
const envConfig = require('../config/envConfigHelper');

// Get all tickets
exports.getTickets = async (req, res) => {
  const l = createLocalizer(req);
  
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
    const tickets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        // Localized status and priority labels
        statusLabel: l.t(`support.status_${data.status}`),
        priorityLabel: data.priority ? l.t(`support.priority_${data.priority}`) : null
      };
    });
    
    res.json({ success: true, tickets, count: tickets.length, language: l.lang });
  } catch (error) {
    console.error('[ERROR] Get tickets error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    
    const ticketDoc = await db.collection('support_tickets').doc(id).get();
    
    if (!ticketDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }
    
    const data = ticketDoc.data();
    const ticket = {
      id: ticketDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      statusLabel: l.t(`support.status_${data.status}`),
      priorityLabel: data.priority ? l.t(`support.priority_${data.priority}`) : null,
      replies: data.replies?.map(reply => ({
        ...reply,
        timestamp: reply.timestamp?.toDate().toISOString()
      })) || []
    };
    
    res.json({ success: true, ticket, language: l.lang });
  } catch (error) {
    console.error('[ERROR] Get ticket error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    await db.collection('support_tickets').doc(id).update({
      status,
      updatedAt: new Date()
    });
    
    res.json({ success: true, message: l.t('support.ticket_updated') });
  } catch (error) {
    console.error('[ERROR] Update status error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Reply to ticket
exports.replyToTicket = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    const { message, sendEmail, sendNotification } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const ticketDoc = await db.collection('support_tickets').doc(id).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
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
        const config = require('../config');
        const { supportReplyEmail } = require('../services/emailTemplate.service');
        
        // Use new SMTP config with fallback to legacy (Firestore > config > process.env)
        const smtpUser = envConfig.get('SMTP_USER') || config.SMTP_USER;
        const smtpPass = envConfig.get('SMTP_PASS') || config.SMTP_PASS;
        // Use support email for support replies instead of no-reply
        const supportEmail = envConfig.get('EMAIL_SUPPORT') || config.EMAIL_SUPPORT || 'support@graphosai.com';
        const fromName = envConfig.get('EMAIL_FROM_NAME') || config.EMAIL_FROM_NAME || 'Graphos AI Studio Support';
        const smtpHost = envConfig.get('SMTP_HOST') || config.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = envConfig.get('SMTP_PORT') || config.SMTP_PORT || 587;
        
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        
        // Get user's preferred language
        let userLang = 'en';
        try {
          const userSnapshot = await db.collection('users')
            .where('email', '==', ticket.userEmail)
            .limit(1)
            .get();
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            userLang = userData.preferredLanguage || userData.language || 'en';
          }
        } catch (langError) {
          console.log('[INFO] Could not get user language, using default');
        }
        
        const htmlContent = supportReplyEmail({
          ticketId: id,
          ticketType: ticket.type,
          userName: ticket.userName,
          ticketTitle: ticket.title,
          replyMessage: message,
          lang: userLang
        });
        
        await transporter.sendMail({
          from: `"${fromName}" <${supportEmail}>`,
          replyTo: supportEmail,
          to: ticket.userEmail,
          subject: `Re: ${ticket.title} - #${id.substring(0, 8)}`,
          html: htmlContent
        });
        
        console.log(`[SUCCESS] Email sent to ${ticket.userEmail} (lang: ${userLang})`);
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
          
          const isBilling = ticket.type === 'billing_support';
          
          // Full i18n support for notification (15 languages)
          const translations = {
            en: {
              title: isBilling ? 'Response to your billing support request' : 'Response to your feedback',
              message: `We have responded to "${ticket.title}":\n\n${message}`,
              cta: 'View Details'
            },
            vi: {
              title: isBilling ? 'Phản hồi yêu cầu hỗ trợ thanh toán' : 'Phản hồi feedback của bạn',
              message: `Chúng tôi đã phản hồi "${ticket.title}":\n\n${message}`,
              cta: 'Xem chi tiết'
            },
            zh: {
              title: isBilling ? '账单支持请求回复' : '您的反馈回复',
              message: `我们已回复"${ticket.title}"：\n\n${message}`,
              cta: '查看详情'
            },
            ja: {
              title: isBilling ? '請求サポートリクエストへの回答' : 'フィードバックへの回答',
              message: `「${ticket.title}」に回答しました：\n\n${message}`,
              cta: '詳細を見る'
            },
            ko: {
              title: isBilling ? '결제 지원 요청에 대한 답변' : '피드백에 대한 답변',
              message: `"${ticket.title}"에 답변했습니다:\n\n${message}`,
              cta: '자세히 보기'
            },
            fr: {
              title: isBilling ? 'Réponse à votre demande de support facturation' : 'Réponse à votre feedback',
              message: `Nous avons répondu à "${ticket.title}" :\n\n${message}`,
              cta: 'Voir les détails'
            },
            de: {
              title: isBilling ? 'Antwort auf Ihre Abrechnungsanfrage' : 'Antwort auf Ihr Feedback',
              message: `Wir haben auf "${ticket.title}" geantwortet:\n\n${message}`,
              cta: 'Details anzeigen'
            },
            es: {
              title: isBilling ? 'Respuesta a su solicitud de soporte de facturación' : 'Respuesta a su comentario',
              message: `Hemos respondido a "${ticket.title}":\n\n${message}`,
              cta: 'Ver detalles'
            },
            pt: {
              title: isBilling ? 'Resposta à sua solicitação de suporte de faturamento' : 'Resposta ao seu feedback',
              message: `Respondemos a "${ticket.title}":\n\n${message}`,
              cta: 'Ver detalhes'
            },
            it: {
              title: isBilling ? 'Risposta alla tua richiesta di supporto fatturazione' : 'Risposta al tuo feedback',
              message: `Abbiamo risposto a "${ticket.title}":\n\n${message}`,
              cta: 'Vedi dettagli'
            },
            ru: {
              title: isBilling ? 'Ответ на ваш запрос по оплате' : 'Ответ на ваш отзыв',
              message: `Мы ответили на "${ticket.title}":\n\n${message}`,
              cta: 'Подробнее'
            },
            ar: {
              title: isBilling ? 'رد على طلب دعم الفواتير' : 'رد على ملاحظاتك',
              message: `لقد قمنا بالرد على "${ticket.title}":\n\n${message}`,
              cta: 'عرض التفاصيل'
            },
            th: {
              title: isBilling ? 'ตอบกลับคำขอสนับสนุนการเรียกเก็บเงิน' : 'ตอบกลับความคิดเห็นของคุณ',
              message: `เราได้ตอบกลับ "${ticket.title}":\n\n${message}`,
              cta: 'ดูรายละเอียด'
            },
            id: {
              title: isBilling ? 'Tanggapan permintaan dukungan tagihan Anda' : 'Tanggapan umpan balik Anda',
              message: `Kami telah menanggapi "${ticket.title}":\n\n${message}`,
              cta: 'Lihat Detail'
            },
            ms: {
              title: isBilling ? 'Maklum balas permintaan sokongan bil anda' : 'Maklum balas kepada maklum balas anda',
              message: `Kami telah membalas "${ticket.title}":\n\n${message}`,
              cta: 'Lihat Butiran'
            }
          };
          
          await db.collection('user_notifications').doc(notificationId).set({
            userId,
            notificationId: null,
            type: 'info',
            priority: 'high',
            translations,
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
      message: l.t('support.reply_sent'),
      reply
    });
  } catch (error) {
    console.error('[ERROR] Reply error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    
    await db.collection('support_tickets').doc(id).delete();
    
    res.json({ success: true, message: l.t('success.deleted') });
  } catch (error) {
    console.error('[ERROR] Delete ticket error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  const l = createLocalizer(req);
  
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
      },
      language: l.lang
    });
  } catch (error) {
    console.error('[ERROR] Get statistics error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

module.exports = exports;

const ContactMessage = require('../models/ContactMessage');
const { sendContactConfirmationEmail } = require('../services/emailService');

async function submitContactMessage(req, res) {
  try {
    const { name, email, institution, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: { message: 'Full name, email address, subject, and message are required.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const contact = await ContactMessage.create({
      name: name.trim(),
      email: cleanEmail,
      institution: institution ? institution.trim() : 'Independent Researcher / Student',
      subject: subject.trim(),
      category: category || 'general',
      message: message.trim()
    });

    // Send confirmation email asynchronously (fails gracefully if SMTP unavailable)
    sendContactConfirmationEmail({
      to: cleanEmail,
      name: contact.name,
      subject: contact.subject,
      ticketId: contact.ticketId
    }).catch((e) => console.warn('Contact auto-responder email error:', e.message));

    return res.status(201).json({
      success: true,
      message: `Thank you! Your scientific inquiry has been logged with NCPOR Dispatch under reference #${contact.ticketId}.`,
      ticketId: contact.ticketId,
      contact: {
        id: contact._id,
        ticketId: contact.ticketId,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        category: contact.category,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Submit Contact Message Error:', error);
    return res.status(500).json({ error: { message: 'Failed to record your inquiry. Please try again.' } });
  }
}

async function listContactMessages(req, res) {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('List Contact Messages Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve contact inquiries.' } });
  }
}

module.exports = {
  submitContactMessage,
  listContactMessages
};

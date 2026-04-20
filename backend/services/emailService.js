const nodemailer = require("nodemailer");

// Create transporter (configure based on your email provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, _success) => {
  if (error) {
    console.log("Email transporter error:", error.message);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"FixOnTheGo Support" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send support message email to staff
 */
const sendSupportEmailToStaff = async (staffEmail, staffName, userName, userEmail, message) => {
  const subject = `New Support Request from ${userName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔧 FixOnTheGo</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Support Request</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #374151; margin-top: 0;">Hello ${staffName},</h2>
        <p style="color: #6b7280;">You have received a new support request:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 10px;"><strong>From:</strong> ${userName}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin-top: 10px;">${message}</p>
        </div>
        
        <p style="color: #6b7280;">Please respond to this request as soon as possible.</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/staff/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
          View Dashboard
        </a>
      </div>
      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} FixOnTheGo. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: staffEmail, subject, html, text: message });
};

/**
 * Send support response email to user
 */
const sendSupportResponseToUser = async (userEmail, userName, staffName, message) => {
  const subject = `Support Response from FixOnTheGo`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔧 FixOnTheGo</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Support Team</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
        <p style="color: #6b7280;">Our support team has responded to your request:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 10px;"><strong>From:</strong> ${staffName} (Support Team)</p>
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin-top: 10px;">${message}</p>
        </div>
        
        <p style="color: #6b7280;">If you need further assistance, please reply through our app or contact support again.</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
          Open App
        </a>
      </div>
      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} FixOnTheGo. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html, text: message });
};

/**
 * Send dispute notification email
 */
const sendDisputeNotification = async (recipientEmail, recipientName, disputeDetails) => {
  const subject = `Dispute Update - ${disputeDetails.status}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Dispute Update</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #374151; margin-top: 0;">Hello ${recipientName},</h2>
        <p style="color: #6b7280;">There's an update on your dispute:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Booking ID:</strong> ${disputeDetails.bookingId}</p>
          <p><strong>Status:</strong> ${disputeDetails.status}</p>
          ${disputeDetails.resolution ? `<p><strong>Resolution:</strong> ${disputeDetails.resolution}</p>` : ''}
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/booking/${disputeDetails.bookingId}" 
           style="display: inline-block; background: #374151; color: white; padding: 12px 24px; 
                  border-radius: 6px; text-decoration: none; margin-top: 15px;">
          View Details
        </a>
      </div>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, html, text: `Dispute status: ${disputeDetails.status}` });
};

module.exports = {
  sendEmail,
  sendSupportEmailToStaff,
  sendSupportResponseToUser,
  sendDisputeNotification,
};

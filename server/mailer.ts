import nodemailer from 'nodemailer';

// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Sends an email with the contact form data
 * @param data The contact form data
 * @returns Promise resolving to the email delivery info
 */
export async function sendContactEmail(data: EmailData) {
  const { name, email, subject, message } = data;
  
  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
    to: 'jnlanahan@gmail.com', // Send to your email
    replyTo: email, // Allow direct reply to the sender
    subject: `Portfolio Contact: ${subject}`,
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #22c55e;">New message from your portfolio</h2>
  <p><strong>From:</strong> ${name} (${email})</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #22c55e;">
    <p style="white-space: pre-line;">${message}</p>
  </div>
  <p style="margin-top: 20px; font-size: 12px; color: #666;">
    This message was sent from your portfolio contact form.
  </p>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Test the connection on startup
export async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('Error connecting to email service:', error);
    return false;
  }
}
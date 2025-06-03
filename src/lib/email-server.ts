import nodemailer from 'nodemailer'
import {
    EMAIL_CONFIG,
    QR_CONFIG,
    EVENT_CONFIG
} from '@/constants/constants'

// Email configuration types
export interface EmailConfig {
    service: 'gmail' | 'sendgrid' | 'smtp'
    auth: {
        user: string
        pass: string
    }
    host?: string
    port?: number
    secure?: boolean
}

export interface EmailTemplate {
    to: string
    subject: string
    html: string
    attachments?: Array<{
        filename: string
        content: string
        encoding: string
    }>
}

// Create transporter based on configuration
function createEmailTransporter() {
    // Validate required environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD

    if (!emailUser) {
        throw new Error('Email user not configured. Please set EMAIL_USER environment variable in .env.local')
    }

    if (!emailPass) {
        throw new Error('Email password not configured. Please set EMAIL_PASSWORD environment variable in .env.local with your Gmail App Password')
    }

    console.log('Email configuration:', {
        user: emailUser,
        hasPassword: !!emailPass,
        passwordLength: emailPass.length
    })

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    })
}

// Generate QR code email HTML template
export function generateQRCodeEmailHTML(params: {
    recipientName: string
    eventName: string
    qrCodeData: string
    eventDates: string
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Event Registration Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .header h1 {
          color: #1e40af;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #64748b;
          margin: 5px 0 0 0;
          font-size: 16px;
        }
        .content {
          margin-bottom: 30px;
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f1f5f9;
          border-radius: 8px;
          border: 2px dashed #cbd5e1;
        }
        .qr-code {
          max-width: ${QR_CONFIG.QR_CODE_SIZE.WIDTH}px;
          height: ${QR_CONFIG.QR_CODE_SIZE.HEIGHT};
          margin: 20px 0;
        }
        .instructions {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${params.eventName}</h1>
          <p>{EMAIL_CONFIG.CONFIRMATION_SUBJECT}</p>
        </div>
        
        <div class="content">
          <h2>Hello ${params.recipientName}!</h2>
          <p>Thank you for registering for <strong>${params.eventName}</strong>. Your registration has been confirmed!</p>
          
          <p><strong>Event Dates:</strong> ${params.eventDates}</p>
          
          <div class="qr-section">
            <h3>Your Event QR Code</h3>
            <p>Please save this QR code and present it at the event for attendance tracking:</p>
            <img src="${params.qrCodeData}" alt="Event QR Code" class="qr-code" />
            <p><em>This QR code is unique to you and should not be shared.</em></p>
          </div>
          
          <div class="instructions">
            <h4>Important Instructions:</h4>
            <ul>
              <li>${EMAIL_CONFIG.QR_CODE_INSTRUCTIONS.SAVE_EMAIL}</li>
              <li>${EMAIL_CONFIG.QR_CODE_INSTRUCTIONS.PRESENT_QR}</li>
              <li>You can check in <span class="highlight">once per day</span> during the ${EVENT_CONFIG.EVENT_DURATION_DAYS}-day event</li>
              <li>${EMAIL_CONFIG.QR_CODE_INSTRUCTIONS.VISIBILITY}</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact the event organizers.</p>
          
          <p>We look forward to seeing you at the event!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2024 ${EMAIL_CONFIG.SENDER_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send QR code email
export async function sendQRCodeEmail(params: {
    to: string
    recipientName: string
    qrCodeData: string
    eventName: string
    eventDates: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const transporter = createEmailTransporter()

        const emailHTML = generateQRCodeEmailHTML({
            recipientName: params.recipientName,
            eventName: params.eventName,
            qrCodeData: params.qrCodeData,
            eventDates: params.eventDates
        })
        console.log(transporter)
        const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || EMAIL_CONFIG.DEFAULT_FROM_EMAIL

        const mailOptions = {
            from: {
                name: EMAIL_CONFIG.SENDER_NAME,
                address: emailUser
            },
            to: params.to,
            subject: `${EMAIL_CONFIG.EMAIL_SUBJECT_PREFIX}${params.eventName}`,
            html: emailHTML,
            text: `Hello ${params.recipientName}!\n\nThank you for registering for ${params.eventName}. Your registration has been confirmed!\n\nEvent Dates: ${params.eventDates}\n\nYour QR code has been attached to this email. Please present it at the event for attendance tracking.\n\nImportant: You can check in once per day during the ${EVENT_CONFIG.EVENT_DURATION_DAYS}-day event.\n\nIf you have any questions, please contact the event organizers.\n\nWe look forward to seeing you at the event!\n\n---\n${EMAIL_CONFIG.SENDER_NAME}`
        }

        const result = await transporter.sendMail(mailOptions)

        return {
            success: true,
            messageId: result.messageId
        }
    } catch (error) {
        console.error('Email sending error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<{ success: boolean; error?: string }> {
    try {
        const transporter = createEmailTransporter()
        await transporter.verify()
        return { success: true }
    } catch (error) {
        console.error('Email configuration error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Email configuration failed'
        }
    }
} 
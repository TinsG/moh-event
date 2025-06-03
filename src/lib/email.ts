import { getEventDates } from '@/constants/constants'

interface SendEmailParams {
    to_email: string
    to_name: string
    qr_code_data: string
    event_name: string
}

export async function sendQRCodeEmail(params: SendEmailParams): Promise<boolean> {
    try {
        const eventDates = getEventDates()

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: params.to_email,
                recipientName: params.to_name,
                qrCodeData: params.qr_code_data,
                eventName: params.event_name,
                eventDates: eventDates
            })
        })

        const result = await response.json()

        if (response.ok && result.success) {
            console.log('Email sent successfully:', result.messageId)
            return true
        } else {
            console.error('Failed to send email:', result.error)
            return false
        }
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

// Health check function to verify email configuration
export async function verifyEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/send-email', {
            method: 'GET'
        })

        const result = await response.json()

        return {
            success: response.ok && result.success,
            error: result.error
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Legacy function for backwards compatibility - no longer needed
export function initializeEmailJS() {
    console.log('Email system initialized - using Node.js API instead of EmailJS')
} 
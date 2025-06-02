import { NextRequest, NextResponse } from 'next/server'
import { sendQRCodeEmail, verifyEmailConfig } from '@/lib/email-server'
import { z } from 'zod'

// Request validation schema
const emailRequestSchema = z.object({
    to: z.string().email('Invalid email address'),
    recipientName: z.string().min(1, 'Recipient name is required'),
    qrCodeData: z.string().min(1, 'QR code data is required'),
    eventName: z.string().min(1, 'Event name is required'),
    eventDates: z.string().min(1, 'Event dates are required')
})

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validatedData = emailRequestSchema.parse(body)

        // Send the email
        const result = await sendQRCodeEmail({
            to: validatedData.to,
            recipientName: validatedData.recipientName,
            qrCodeData: validatedData.qrCodeData,
            eventName: validatedData.eventName,
            eventDates: validatedData.eventDates
        })

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully',
                messageId: result.messageId
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to send email'
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Email API error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request data',
                details: error.errors
            }, { status: 400 })
        }

        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}

// Health check endpoint to verify email configuration
export async function GET() {
    try {
        const result = await verifyEmailConfig()

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email configuration is valid'
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'Email configuration failed'
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Email config verification error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to verify email configuration'
        }, { status: 500 })
    }
} 
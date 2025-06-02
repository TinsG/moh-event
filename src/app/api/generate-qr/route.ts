import { NextRequest, NextResponse } from 'next/server'
import { generateQRCode, type QRCodeData } from '@/lib/qr-utils'
import { z } from 'zod'

// Request validation schema
const qrCodeRequestSchema = z.object({
    registrationId: z.string().min(1, 'Registration ID is required'),
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(1, 'Full name is required'),
    eventId: z.string().optional(),
    issuedAt: z.number().optional()
})

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validatedData = qrCodeRequestSchema.parse(body)

        // Create QR code data
        const qrCodeData: QRCodeData = {
            registrationId: validatedData.registrationId,
            email: validatedData.email,
            fullName: validatedData.fullName,
            eventId: validatedData.eventId || process.env.NEXT_PUBLIC_EVENT_NAME || 'MOH Event 2024',
            issuedAt: validatedData.issuedAt || Date.now()
        }

        // Generate QR code
        const qrCodeImage = await generateQRCode(qrCodeData)

        return NextResponse.json({
            success: true,
            qrCode: qrCodeImage
        })
    } catch (error) {
        console.error('QR Code generation error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request data',
                details: error.errors
            }, { status: 400 })
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to generate QR code'
        }, { status: 500 })
    }
} 
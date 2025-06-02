import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface QRCodeData {
    registrationId: string
    email: string
    fullName: string
    eventId: string
    issuedAt: number
}

export async function generateQRCode(data: QRCodeData): Promise<string> {
    try {
        // Generate QR code from the JWT token
        const token = jwt.sign(data, JWT_SECRET, { expiresIn: '30d' })
        const qrCodeDataURL = await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        })

        return qrCodeDataURL
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

export function validateQRCode(qrCodeData: string): QRCodeData | null {
    try {
        const decoded = jwt.verify(qrCodeData, JWT_SECRET) as QRCodeData
        return decoded
    } catch (error) {
        console.error('Error validating QR code:', error)
        return null
    }
}

export function createQRCodeData(
    registrationId: string,
    email: string,
    fullName: string
): QRCodeData {
    return {
        registrationId,
        email,
        fullName,
        eventId: process.env.NEXT_PUBLIC_EVENT_NAME || 'MOH Event 2024',
        issuedAt: Date.now()
    }
} 
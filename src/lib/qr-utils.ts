import QRCode from 'qrcode'
import { getEventName } from '@/constants/constants'

export interface QRCodeData {
    registrationId: string
    email: string
    fullName: string
    eventId: string
    issuedAt: number
}

export async function generateQRCode(data: QRCodeData): Promise<string> {
    try {
        // Generate QR code from plain JSON data
        const qrData = JSON.stringify(data)
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
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
        // Parse plain JSON data
        const decoded = JSON.parse(qrCodeData) as QRCodeData

        // Basic validation to ensure it's our QR code format
        if (!decoded.registrationId || !decoded.email || !decoded.fullName) {
            console.error('Invalid QR code format: missing required fields')
            return null
        }

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
        eventId: getEventName(),
        issuedAt: Date.now()
    }
} 
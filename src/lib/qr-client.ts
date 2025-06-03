// Client-side QR code utilities

import { getEventName } from '@/constants/constants'

export interface QRCodeData {
    registrationId: string
    email: string
    fullName: string
    eventId?: string
    issuedAt?: number
}

export async function generateQRCodeClient(data: QRCodeData): Promise<string> {
    try {
        const response = await fetch('/api/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })

        const result = await response.json()

        if (response.ok && result.success) {
            return result.qrCode
        } else {
            throw new Error(result.error || 'Failed to generate QR code')
        }
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

export function createQRCodeDataClient(
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
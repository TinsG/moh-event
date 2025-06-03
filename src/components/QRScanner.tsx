'use client'

import { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Camera, CameraOff, CheckCircle, XCircle, User, Calendar, Building } from 'lucide-react'
import { validateQRCode } from '@/lib/qr-utils'
import { markAttendance, getCurrentEventDay } from '@/lib/attendance'
import { supabase } from '@/lib/supabase'
import { EVENT_CONFIG, UI_CONSTANTS, ATTENDANCE_CONFIG } from '@/constants/constants'

interface RegistrationData {
    id: string
    full_name: string
    email: string
    organization: string
    position: string
}

interface QRScannerProps {
    scannerUserId: string
}

export default function QRScanner({ scannerUserId }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [lastScanResult, setLastScanResult] = useState<{
        success: boolean
        message: string
        registrationData?: RegistrationData
        day?: number
    } | null>(null)
    const [currentDay, setCurrentDay] = useState<number>(ATTENDANCE_CONFIG.INVALID_DAY_INDICATOR)

    const videoRef = useRef<HTMLVideoElement>(null)
    const qrScannerRef = useRef<QrScanner | null>(null)

    useEffect(() => {
        setCurrentDay(getCurrentEventDay())
    }, [])

    const startScanning = async () => {
        if (!videoRef.current) return

        try {
            setIsScanning(true)
            setLastScanResult(null)

            qrScannerRef.current = new QrScanner(
                videoRef.current,
                async (result) => {
                    await handleScanResult(result.data)
                },
                {
                    onDecodeError: (error) => {
                        console.warn('QR decode error:', error)
                    },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment'
                }
            )

            await qrScannerRef.current.start()
        } catch (error) {
            console.error('Error starting scanner:', error)
            toast.error('Failed to start camera. Please check permissions.')
            setIsScanning(false)
        }
    }

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop()
            qrScannerRef.current.destroy()
            qrScannerRef.current = null
        }
        setIsScanning(false)
    }

    const handleScanResult = async (qrData: string) => {
        // Temporarily stop scanning to prevent multiple scans
        stopScanning()

        try {
            // Validate QR code
            const qrCodeData = validateQRCode(qrData)

            if (!qrCodeData) {
                setLastScanResult({
                    success: false,
                    message: 'Invalid QR code. Please ensure you are scanning a valid event QR code.'
                })
                toast.error('Invalid QR code')
                return
            }

            // Fetch registration data
            const { data: registration, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('id', qrCodeData.registrationId)
                .single()

            if (error || !registration) {
                setLastScanResult({
                    success: false,
                    message: 'Registration not found. Please contact event organizers.'
                })
                toast.error('Registration not found')
                return
            }

            // Verify email matches
            if (registration.email !== qrCodeData.email) {
                setLastScanResult({
                    success: false,
                    message: 'QR code validation failed. Email mismatch detected.'
                })
                toast.error('QR code validation failed')
                return
            }

            // Mark attendance
            const attendanceResult = await markAttendance(registration.id, scannerUserId)

            setLastScanResult({
                success: attendanceResult.success,
                message: attendanceResult.message,
                registrationData: registration,
                day: attendanceResult.day
            })

            if (attendanceResult.success) {
                toast.success(attendanceResult.message)
            } else {
                toast.error(attendanceResult.message)
            }

        } catch (error) {
            console.error('Error processing scan:', error)
            setLastScanResult({
                success: false,
                message: 'An error occurred while processing the QR code.'
            })
            toast.error('Scan processing failed')
        }
    }

    useEffect(() => {
        return () => {
            stopScanning()
        }
    }, [])

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
            {/* Event Day Status */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5" />
                        Event Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentDay > 0 && currentDay <= EVENT_CONFIG.EVENT_DURATION_DAYS ? (
                        <Badge variant={UI_CONSTANTS.BADGES.ACTIVE_VARIANT} className="text-sm px-3 py-1">
                            {EVENT_CONFIG.DAY_LABELS[currentDay as keyof typeof EVENT_CONFIG.DAY_LABELS]} - {EVENT_CONFIG.EVENT_STATUS.ACTIVE}
                        </Badge>
                    ) : (
                        <Badge variant={UI_CONSTANTS.BADGES.INACTIVE_VARIANT} className="text-sm px-3 py-1">
                            {EVENT_CONFIG.EVENT_STATUS.INACTIVE}
                        </Badge>
                    )}
                </CardContent>
            </Card>

            {/* Scanner Card */}
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Camera className="h-6 w-6" />
                        QR Code Scanner
                    </CardTitle>
                    <CardDescription>
                        Scan attendee QR codes to mark attendance for {currentDay > 0 ? EVENT_CONFIG.DAY_LABELS[currentDay as keyof typeof EVENT_CONFIG.DAY_LABELS] : 'N/A'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Camera View */}
                    <div className="relative w-full aspect-square max-w-sm mx-auto">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover rounded-lg border-2 border-dashed border-gray-300"
                            style={{ display: isScanning ? 'block' : 'none' }}
                        />

                        {!isScanning && (
                            <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                <div className="text-center space-y-2">
                                    <Camera className="h-12 w-12 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600">Camera preview will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scanner Controls */}
                    <div className="flex justify-center">
                        {!isScanning ? (
                            <Button
                                onClick={startScanning}
                                disabled={currentDay <= 0}
                                className="w-full max-w-xs h-12 text-lg font-semibold"
                            >
                                <Camera className="mr-2 h-5 w-5" />
                                Start Scanning
                            </Button>
                        ) : (
                            <Button
                                onClick={stopScanning}
                                variant="outline"
                                className="w-full max-w-xs h-12 text-lg font-semibold"
                            >
                                <CameraOff className="mr-2 h-5 w-5" />
                                Stop Scanning
                            </Button>
                        )}
                    </div>

                    {/* Scan Result */}
                    {lastScanResult && (
                        <Alert className={`${lastScanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex items-start gap-3">
                                {lastScanResult.success ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1 space-y-2">
                                    <AlertDescription className={`${lastScanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {lastScanResult.message}
                                    </AlertDescription>

                                    {lastScanResult.success && lastScanResult.registrationData && (
                                        <div className="space-y-2 pt-2 border-t border-green-200">
                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{lastScanResult.registrationData.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                <Building className="h-4 w-4" />
                                                <span>{lastScanResult.registrationData.organization}</span>
                                            </div>
                                            <div className="text-sm text-green-600">
                                                {lastScanResult.registrationData.email}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Instructions */}
                    <div className="text-center space-y-2 pt-4">
                        <p className="text-sm text-gray-600">
                            Position the QR code within the camera view to scan
                        </p>
                        <p className="text-xs text-gray-500">
                            Attendance can only be marked once per day per person
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
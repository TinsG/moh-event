'use client'
'use strict'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, UserPlus, Mail, Phone, Building, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateQRCodeClient, createQRCodeDataClient } from '@/lib/qr-client'
import { sendQRCodeEmail } from '@/lib/email'
import {
    EVENT_CONFIG,
    UI_CONSTANTS,
    QR_CONFIG,
    getEventName,
    getEventDates
} from '@/constants/constants'

// Client-side email sending function
async function sendQRCodeEmailClient(params: {
    to: string
    recipientName: string
    qrCodeData: string
    eventName: string
    eventDates: string
}): Promise<boolean> {
    try {
        const response = await sendQRCodeEmail({
            to_email: params.to,
            to_name: params.recipientName,
            qr_code_data: params.qrCodeData,
            event_name: params.eventName
        })

        return response
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

const registrationSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    organization: z.string().min(2, 'Organization name is required'),
    position: z.string().min(2, 'Position is required')
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface RegistrationFormProps {
    onSuccess?: () => void
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [eventName, setEventName] = useState<string>(EVENT_CONFIG.DEFAULT_EVENT_NAME)
    const [eventDates, setEventDates] = useState<string>(`${EVENT_CONFIG.DEFAULT_START_DATE} to ${EVENT_CONFIG.DEFAULT_END_DATE}`)

    // Set environment-dependent values after hydration
    useEffect(() => {
        setEventName(getEventName())
        setEventDates(getEventDates())
    }, [])

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            organization: '',
            position: ''
        }
    })

    const onSubmit = async (data: RegistrationFormData) => {
        setIsSubmitting(true)

        try {
            // Check if email already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('registrations')
                .select('email')
                .eq('email', data.email.toLowerCase())

            if (existingUser && existingUser.length > 0) {
                toast.error('This email is already registered for the event.')
                setIsSubmitting(false)
                return
            }

            // Generate QR code data
            const tempId = `${QR_CONFIG.TEMP_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const qrCodeData = createQRCodeDataClient(tempId, data.email, data.fullName)
            const qrCodeImage = await generateQRCodeClient(qrCodeData)

            // Save to database
            const { data: registration, error: insertError } = await supabase
                .from('registrations')
                .insert({
                    full_name: data.fullName,
                    email: data.email.toLowerCase(),
                    phone: data.phone,
                    organization: data.organization,
                    position: data.position,
                    qr_code: qrCodeImage
                })
                .select()

            if (insertError) {
                console.error('Registration error:', insertError)
                toast.error('Failed to register. Please try again.')
                setIsSubmitting(false)
                return
            }

            // Update QR code with actual registration ID
            const updatedQRCodeData = createQRCodeDataClient(registration[0].id, data.email, data.fullName)
            const updatedQRCodeImage = await generateQRCodeClient(updatedQRCodeData)

            await supabase
                .from('registrations')
                .update({ qr_code: updatedQRCodeImage })
                .eq('id', registration[0].id)

            // Send email with QR code
            const emailSent = await sendQRCodeEmailClient({
                to: data.email,
                recipientName: data.fullName,
                qrCodeData: updatedQRCodeImage,
                eventName,
                eventDates
            })

            if (!emailSent) {
                toast.warning('Registration successful, but email delivery failed. QR code can be retrieved later.')
            } else {
                toast.success('Registration successful! Check your email for the QR code.')
            }

            form.reset()
            onSuccess?.()
        } catch (error) {
            console.error('Registration error:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <Card className="shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{UI_CONSTANTS.REGISTRATION_FORM.TITLE}</CardTitle>
                    <CardDescription className="text-base">
                        {UI_CONSTANTS.REGISTRATION_FORM.DESCRIPTION_PREFIX}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            Full Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name"
                                                className="h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                className="h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="organization"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Organization
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your organization"
                                                className="h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Position/Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your position or job title"
                                                className="h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 text-lg font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-5 w-5" />
                                        Register for Event
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
} 
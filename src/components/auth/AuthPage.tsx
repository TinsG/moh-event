'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import EventRegistrationForm from './EventRegistrationForm'
import { LogIn, UserPlus, Calendar, CalendarPlus } from 'lucide-react'
import Image from 'next/image'
import { getEventInfo } from '@/constants/constants'

interface AuthPageProps {
    onSuccess?: () => void
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register')

    const eventInfo = getEventInfo()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="flex flex-col justify-center items-center space-y-2">
                    <div className="flex flex-row justify-center space-x-8 items-center space-y-2 w-full">
                        <Image src="/ghiqs.png" alt="Logo" width={200} height={200} />
                        <Image src="/logo.png" alt="Logo" width={100} height={100} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {eventInfo.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{eventInfo.dates}</span>
                    </div>
                </div>

                {/* Auth Forms */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="register" className="flex items-center gap-1 text-xs hover:cursor-pointer">
                            <CalendarPlus className="h-3 w-3" />
                            Register
                        </TabsTrigger>
                        <TabsTrigger value="login" className="flex items-center gap-1 text-xs hover:cursor-pointer">
                            <LogIn className="h-3 w-3" />
                            Sign In
                        </TabsTrigger>

                    </TabsList>

                    <TabsContent value="login" className="mt-6">
                        <LoginForm
                            onSuccess={onSuccess}

                        />
                    </TabsContent>



                    <TabsContent value="register" className="mt-6">
                        <Card className="shadow-lg">
                            <CardHeader className="space-y-2 text-center">
                                <div className="flex justify-center mb-2">
                                    <CalendarPlus className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold">Event Registration</CardTitle>
                                <CardDescription>
                                    Register for Global Health Innovation and Quality Summit 2025 and receive your QR code
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EventRegistrationForm
                                    onSuccess={() => {
                                        // Show success message and optionally switch to login
                                        setActiveTab('login')
                                    }}
                                />

                                <div className="text-center pt-4 border-t mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Need system access?{' '}
                                        <Button
                                            variant="link"
                                            onClick={() => setActiveTab('login')}
                                            className="p-0 h-auto text-sm font-medium"
                                        >
                                            Sign In
                                        </Button>
                                        {' '}

                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    )
} 
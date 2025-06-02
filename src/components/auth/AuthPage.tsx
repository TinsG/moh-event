'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import { LogIn, UserPlus, Calendar } from 'lucide-react'

interface AuthPageProps {
    onSuccess?: () => void
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

    const eventInfo = {
        name: process.env.NEXT_PUBLIC_EVENT_NAME || 'MOH Event 2024',
        startDate: process.env.NEXT_PUBLIC_EVENT_START_DATE || '2024-03-01',
        endDate: process.env.NEXT_PUBLIC_EVENT_END_DATE || '2024-03-03'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {eventInfo.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{eventInfo.startDate} to {eventInfo.endDate}</span>
                    </div>
                </div>

                {/* Auth Forms */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login" className="flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-6">
                        <LoginForm
                            onSuccess={onSuccess}
                            onSwitchToSignUp={() => setActiveTab('signup')}
                        />
                    </TabsContent>

                    <TabsContent value="signup" className="mt-6">
                        <SignUpForm
                            onSuccess={onSuccess}
                            onSwitchToLogin={() => setActiveTab('login')}
                        />
                    </TabsContent>
                </Tabs>

                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-800">System Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-blue-700">
                        <p className="text-sm">
                            All users have access to registration, QR code scanning, and attendance reports.
                        </p>
                        <p className="text-sm text-blue-600">
                            Contact your administrator for account creation if needed.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 
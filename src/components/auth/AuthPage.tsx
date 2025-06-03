'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import { LogIn, UserPlus, Calendar } from 'lucide-react'
import Image from 'next/image'
import { getEventInfo } from '@/constants/constants'

interface AuthPageProps {
    onSuccess?: () => void
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

    const eventInfo = getEventInfo()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="flex flex-col justify-center items-center space-y-2">
                    <Image src="/logo.png" alt="Logo" width={100} height={100} />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {eventInfo.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{eventInfo.dates}</span>
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

            </div>
        </div>
    )
} 
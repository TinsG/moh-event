'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { signIn, resetPassword } from '@/lib/auth'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
    onSuccess?: () => void

}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showResetPassword, setShowResetPassword] = useState(false)

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            await signIn(data)
            toast.success('Successfully signed in!')
            onSuccess?.()
        } catch (error: any) {
            console.error('Login error:', error)
            setError(error.message || 'Failed to sign in. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async () => {
        const email = form.getValues('email')

        if (!email) {
            toast.error('Please enter your email address first')
            return
        }

        try {
            await resetPassword(email)
            toast.success('Password reset email sent! Check your inbox.')
            setShowResetPassword(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset email')
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access the MOH Event system
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert className="mb-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                placeholder="Enter your email"
                                                className="h-11"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                className="h-11"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 text-base font-semibold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign In
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 space-y-4">
                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={() => setShowResetPassword(!showResetPassword)}
                                className="text-sm"
                            >
                                Forgot your password?
                            </Button>
                        </div>

                        {showResetPassword && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground text-center">
                                    Enter your email above and click below to reset your password
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleResetPassword}
                                    className="w-full"
                                >
                                    Send Reset Email
                                </Button>
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
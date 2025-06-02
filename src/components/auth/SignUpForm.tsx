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
import { Loader2, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react'
import { signUp } from '@/lib/auth'

const signUpSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
    onSuccess?: () => void
    onSwitchToLogin?: () => void
}

export default function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signUp({
                email: data.email,
                password: data.password
            })

            if (result.needsEmailConfirmation) {
                toast.success('Account created! Please check your email to confirm your account.')
            } else {
                toast.success('Account created successfully!')
            }

            onSuccess?.()
        } catch (error: any) {
            console.error('Sign up error:', error)
            setError(error.message || 'Failed to create account. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Sign up to access the MOH Event system
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
                                                placeholder="Create a password"
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
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Confirm Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Confirm your password"
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {onSwitchToLogin && (
                        <div className="text-center pt-4 border-t mt-6">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Button
                                    variant="link"
                                    onClick={onSwitchToLogin}
                                    className="p-0 h-auto text-sm font-medium"
                                >
                                    Sign In
                                </Button>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 
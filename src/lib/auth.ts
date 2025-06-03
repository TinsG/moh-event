import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
    id: string
    email: string
    created_at: string
}

export interface SignUpData {
    email: string
    password: string
}

export interface SignInData {
    email: string
    password: string
}

// Sign up a new user
export async function signUp(data: SignUpData) {
    try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            },
        })

        if (authError) {
            throw authError
        }

        if (!authData.user) {
            throw new Error('Failed to create user')
        }

        // The user will be created in the users table via the database trigger
        // Let's wait a moment and then fetch the user data if there's a session
        let userData = null
        if (authData.session) {
            // User is logged in, we can fetch their data
            userData = await getCurrentUser()
        }

        return {
            user: userData,
            session: authData.session,
            needsEmailConfirmation: !authData.session
        }
    } catch (error) {
        console.error('Sign up error:', error)
        throw error
    }
}

// Sign in user
export async function signIn(data: SignInData) {
    try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (error) {
            throw error
        }

        // Get user from our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (userError) {
            throw new Error('User not found in system')
        }

        return {
            user: userData,
            session: authData.session
        }
    } catch (error) {
        console.error('Sign in error:', error)
        throw error
    }
}

// Sign out user
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            throw error
        }
    } catch (error) {
        console.error('Sign out error:', error)
        throw error
    }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            throw error
        }

        if (!user) {
            return null
        }

        // Get user from our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (userError) {
            console.error('Error fetching user data:', userError)
            return null
        }

        return userData
    } catch (error) {
        console.error('Get current user error:', error)
        return null
    }
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            throw error
        }

        return session
    } catch (error) {
        console.error('Get current session error:', error)
        return null
    }
}

// Reset password
export async function resetPassword(email: string) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
            throw error
        }
    } catch (error) {
        console.error('Reset password error:', error)
        throw error
    }
}

// Update password
export async function updatePassword(newPassword: string) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            throw error
        }
    } catch (error) {
        console.error('Update password error:', error)
        throw error
    }
} 
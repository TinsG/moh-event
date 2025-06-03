'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
    user: AuthUser | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession()
                setSession(initialSession)
                if (initialSession?.user) {
                    const userData = await getCurrentUser()
                    setUser(userData)
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Error getting initial session:', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)

                if (session?.user) {
                    try {
                        // Use the consistent getCurrentUser function instead of direct database query
                        const userData = await getCurrentUser()
                        setUser(userData)
                    } catch (error) {
                        console.error('Error getting user data:', error)
                        setUser(null)
                    }
                } else {
                    setUser(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) {
                throw error
            }
            // State will be updated by the auth state change listener
        } catch (error) {
            console.error('Error signing out:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const value: AuthContextType = {
        user,
        session,
        loading,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
} 
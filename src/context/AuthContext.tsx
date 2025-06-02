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
                }
            } catch (error) {
                console.error('Error getting initial session:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // console.log('Auth state changed:', event, session?.user?.email)

                setSession(session)
                // console.log('session', session?.user)
                setLoading(false)

                if (session?.user) {
                    try {
                        const { data: userData, error: userError } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', session?.user?.email)

                        setUser(userData?.[0] || null)
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
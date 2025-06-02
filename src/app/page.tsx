'use client'

import { useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import AuthPage from '@/components/auth/AuthPage'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { initializeEmailJS } from '@/lib/email'
import { Loader2 } from 'lucide-react'
import ClientOnly from '@/components/ClientOnly'

function AppContent() {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Initialize EmailJS when the app loads
    initializeEmailJS()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <main className="min-h-screen">
        <ClientOnly
          fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          }
        >
          <AppContent />
        </ClientOnly>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </main>
    </AuthProvider>
  )
}

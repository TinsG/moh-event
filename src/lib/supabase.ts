import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
    public: {
        Tables: {
            registrations: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    phone: string
                    organization: string
                    position: string
                    qr_code: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    full_name: string
                    phone: string
                    organization: string
                    position: string
                    qr_code: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    phone?: string
                    organization?: string
                    position?: string
                    qr_code?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            attendance: {
                Row: {
                    id: string
                    registration_id: string
                    day: number
                    scanned_at: string
                    scanner_user_id: string
                }
                Insert: {
                    id?: string
                    registration_id: string
                    day: number
                    scanned_at?: string
                    scanner_user_id: string
                }
                Update: {
                    id?: string
                    registration_id?: string
                    day?: number
                    scanned_at?: string
                    scanner_user_id?: string
                }
            }
            users: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
} 
import { supabase } from './supabase'
import { format, isToday, startOfDay, endOfDay } from 'date-fns'
import { EVENT_CONFIG, ATTENDANCE_CONFIG, getEventStartDate } from '@/constants/constants'

export interface AttendanceRecord {
    id: string
    registration_id: string
    day: number
    scanned_at: string
    scanner_user_id: string
}

export function getCurrentEventDay(): number {
    const eventStartDate = new Date(getEventStartDate())
    const today = new Date()
    const diffTime = today.getTime() - eventStartDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Return day 1, 2, or 3 based on the event dates
    if (diffDays <= 1) return 1
    if (diffDays <= 2) return 2
    if (diffDays <= EVENT_CONFIG.EVENT_DURATION_DAYS) return EVENT_CONFIG.EVENT_DURATION_DAYS

    // If outside event dates, return invalid indicator
    return ATTENDANCE_CONFIG.INVALID_DAY_INDICATOR
}

export async function markAttendance(
    registrationId: string,
    scannerUserId: string
): Promise<{ success: boolean; message: string; day?: number }> {
    try {
        const currentDay = getCurrentEventDay()

        if (currentDay === ATTENDANCE_CONFIG.INVALID_DAY_INDICATOR) {
            return {
                success: false,
                message: ATTENDANCE_CONFIG.MESSAGES.OUTSIDE_EVENT
            }
        }

        // Check if already marked attendance for today
        const today = new Date()
        const { data: existingAttendance, error: checkError } = await supabase
            .from('attendance')
            .select('*')
            .eq('registration_id', registrationId)
            .eq('day', currentDay)
            .gte('scanned_at', startOfDay(today).toISOString())
            .lte('scanned_at', endOfDay(today).toISOString())
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing attendance:', checkError)
            return {
                success: false,
                message: ATTENDANCE_CONFIG.MESSAGES.ERROR_CHECKING
            }
        }

        if (existingAttendance) {
            return {
                success: false,
                message: `${ATTENDANCE_CONFIG.MESSAGES.ALREADY_MARKED} ${currentDay} at ${format(new Date(existingAttendance.scanned_at), 'HH:mm')}.`
            }
        }

        // Mark new attendance
        const { data, error } = await supabase
            .from('attendance')
            .insert({
                registration_id: registrationId,
                day: currentDay,
                scanner_user_id: scannerUserId,
                scanned_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Error marking attendance:', error)
            return {
                success: false,
                message: 'Failed to mark attendance. Please try again.'
            }
        }

        return {
            success: true,
            message: `Attendance marked successfully for Day ${currentDay}!`,
            day: currentDay
        }
    } catch (error) {
        console.error('Error in markAttendance:', error)
        return {
            success: false,
            message: 'An unexpected error occurred while marking attendance.'
        }
    }
}

export async function getAttendanceHistory(registrationId: string): Promise<AttendanceRecord[]> {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('registration_id', registrationId)
            .order('scanned_at', { ascending: false })

        if (error) {
            console.error('Error fetching attendance history:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in getAttendanceHistory:', error)
        return []
    }
}

export async function getAllAttendanceForDay(day: number): Promise<{
    attendees: Array<{
        registration_id: string
        full_name: string
        email: string
        scanned_at: string
    }>
    total: number
}> {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
        registration_id,
        scanned_at,
        registrations:registration_id (
          full_name,
          email
        )
      `)
            .eq('day', day)
            .order('scanned_at', { ascending: false })

        if (error) {
            console.error('Error fetching day attendance:', error)
            return { attendees: [], total: 0 }
        }

        const attendees = data?.map(record => ({
            registration_id: record.registration_id,
            full_name: (record.registrations as any)?.full_name || 'Unknown',
            email: (record.registrations as any)?.email || 'Unknown',
            scanned_at: record.scanned_at
        })) || []

        return {
            attendees,
            total: attendees.length
        }
    } catch (error) {
        console.error('Error in getAllAttendanceForDay:', error)
        return { attendees: [], total: 0 }
    }
} 
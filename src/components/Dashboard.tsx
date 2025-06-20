'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserPlus, QrCode, Calendar, Users, BarChart3, LogOut, User } from 'lucide-react'
import RegistrationForm from './RegistrationForm'
import QRScanner from './QRScanner'
// import AttendanceReport from './AttendanceReport'
import { getCurrentEventDay } from '@/lib/attendance'
import AttendanceReport from './AttendanceReport'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import {
    EVENT_CONFIG,
    UI_CONSTANTS,
    getEventInfo
} from '@/constants/constants'
import RegisteredUsersTable from './RegisteredUsersTable'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
    const { user, signOut } = useAuth()
    const [activeTab, setActiveTab] = useState('users')
    const [registrationCount, setRegistrationCount] = useState(0)
    const [organizationCount, setOrganizationCount] = useState(0)
    const [eventInfo, setEventInfo] = useState({
        name: EVENT_CONFIG.DEFAULT_EVENT_NAME,
        startDate: EVENT_CONFIG.DEFAULT_START_DATE,
        endDate: EVENT_CONFIG.DEFAULT_END_DATE,
        dates: `${EVENT_CONFIG.DEFAULT_START_DATE} to ${EVENT_CONFIG.DEFAULT_END_DATE}`
    })
    const currentDay = getCurrentEventDay()

    // Fetch total registration count
    const fetchRegistrationCount = async () => {
        const { count, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
        if (!error && typeof count === 'number') {
            setRegistrationCount(count)
        }
    }

    // Fetch total unique organizations
    const fetchOrganizationCount = async () => {
        const { data, error } = await supabase
            .from('registrations')
            .select('organization')
        if (!error && Array.isArray(data)) {
            const uniqueOrgs = new Set(
                data
                    .map((u: any) => u.organization?.toLowerCase().trim())
                    .filter(Boolean)
            )
            setOrganizationCount(uniqueOrgs.size)
        }
    }

    useEffect(() => {
        setEventInfo({
            name: EVENT_CONFIG.DEFAULT_EVENT_NAME,
            startDate: EVENT_CONFIG.DEFAULT_START_DATE,
            endDate: EVENT_CONFIG.DEFAULT_END_DATE,
            dates: `${EVENT_CONFIG.DEFAULT_START_DATE} to ${EVENT_CONFIG.DEFAULT_END_DATE}`
        })
        fetchRegistrationCount()
        fetchOrganizationCount()
    }, [])

    const handleRegistrationSuccess = () => {
        fetchRegistrationCount()
        fetchOrganizationCount()
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success('Successfully signed out')
        } catch (error) {
            toast.error('Failed to sign out ' + error)
        }
    }

    if (!user) {
        return null // This shouldn't happen due to the auth guard, but just in case
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header with User Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-center sm:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {eventInfo.name}
                        </h1>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                            <Badge variant={UI_CONSTANTS.BADGES.OUTLINE_VARIANT} className="px-3 py-1">
                                <Calendar className="mr-2 h-4 w-4" />
                                {eventInfo.startDate} to {eventInfo.endDate}
                            </Badge>
                            {currentDay > 0 && currentDay <= EVENT_CONFIG.EVENT_DURATION_DAYS ? (
                                <Badge variant={UI_CONSTANTS.BADGES.ACTIVE_VARIANT} className="px-3 py-1">
                                    {EVENT_CONFIG.DAY_LABELS[currentDay as keyof typeof EVENT_CONFIG.DAY_LABELS]} - {EVENT_CONFIG.EVENT_STATUS.ACTIVE}
                                </Badge>
                            ) : (
                                <Badge variant={UI_CONSTANTS.BADGES.INACTIVE_VARIANT} className="px-3 py-1">
                                    {EVENT_CONFIG.EVENT_STATUS.INACTIVE}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSignOut}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{UI_CONSTANTS.DASHBOARD.TITLE_REGISTRATION_COUNT}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{registrationCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {UI_CONSTANTS.DASHBOARD.DESCRIPTION_REGISTRATIONS}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Organizations Attended</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{organizationCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Total unique organizations with registered users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{UI_CONSTANTS.DASHBOARD.TITLE_CURRENT_DAY}</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {currentDay > 0 && currentDay <= EVENT_CONFIG.EVENT_DURATION_DAYS ?
                                    EVENT_CONFIG.DAY_LABELS[currentDay as keyof typeof EVENT_CONFIG.DAY_LABELS] :
                                    EVENT_CONFIG.EVENT_STATUS.INACTIVE
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {UI_CONSTANTS.DASHBOARD.DESCRIPTION_PROGRESS}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Registered Users</span>
                        </TabsTrigger>
                        <TabsTrigger value="register" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Register</span>
                        </TabsTrigger>
                        <TabsTrigger value="scan" className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            <span className="hidden sm:inline">Scan QR</span>
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Reports</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Registered Users
                                </CardTitle>
                                <CardDescription>
                                    View, search, filter, and export the list of all registered users for the event.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RegisteredUsersTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    New Registration
                                </CardTitle>
                                <CardDescription>
                                    Register a new attendee for the event. A QR code will be generated and sent via email.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RegistrationForm onSuccess={handleRegistrationSuccess} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="scan" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    QR Code Scanner
                                </CardTitle>
                                <CardDescription>
                                    Scan attendee QR codes to mark attendance. Each person can only check in once per day.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QRScanner scannerUserId={user.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Attendance Reports
                                </CardTitle>
                                <CardDescription>
                                    View attendance statistics and detailed reports for each day of the event.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AttendanceReport />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Instructions */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-blue-800">Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-blue-700">
                        <p className="text-sm">
                            <strong>Registration:</strong> Fill in attendee details to generate a QR code that will be emailed to them.
                        </p>
                        <p className="text-sm">
                            <strong>QR Scanning:</strong> Use the camera to scan attendee QR codes for attendance tracking.
                        </p>
                        <p className="text-sm">
                            <strong>Attendance:</strong> Each attendee can only check in once per day during the 3-day event.
                        </p>
                        <p className="text-sm">
                            <strong>Reports:</strong> View detailed attendance statistics and export data as needed.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 
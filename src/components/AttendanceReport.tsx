'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Users, Download, RefreshCw } from 'lucide-react'
import { getAllAttendanceForDay } from '@/lib/attendance'
import { format } from 'date-fns'

interface AttendeeData {
    registration_id: string
    full_name: string
    email: string
    scanned_at: string
}

export default function AttendanceReport() {
    const [selectedDay, setSelectedDay] = useState<string>('1')
    const [attendees, setAttendees] = useState<AttendeeData[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const loadAttendanceData = async (day: number) => {
        setLoading(true)
        try {
            const result = await getAllAttendanceForDay(day)
            setAttendees(result.attendees)
            setTotalCount(result.total)
        } catch (error) {
            console.error('Error loading attendance data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAttendanceData(parseInt(selectedDay))
    }, [selectedDay])

    const handleRefresh = () => {
        loadAttendanceData(parseInt(selectedDay))
    }

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Check-in Time']
        const csvContent = [
            headers.join(','),
            ...attendees.map(attendee => [
                `"${attendee.full_name}"`,
                `"${attendee.email}"`,
                `"${format(new Date(attendee.scanned_at), 'MMM dd, yyyy HH:mm')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `attendance-day-${selectedDay}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Day:</span>
                    </div>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Day 1</SelectItem>
                            <SelectItem value="2">Day 2</SelectItem>
                            <SelectItem value="3">Day 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        disabled={attendees.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Day {selectedDay} Attendance</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total check-ins
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Badge variant={totalCount > 0 ? "default" : "secondary"}>
                                {totalCount > 0 ? "Active" : "No Data"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Day status
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {format(new Date(), 'HH:mm')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Day {selectedDay} Attendees ({totalCount})
                    </CardTitle>
                    <CardDescription>
                        List of all attendees who checked in on Day {selectedDay}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            Loading attendance data...
                        </div>
                    ) : attendees.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead>Check-in Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendees.map((attendee, index) => (
                                        <TableRow key={`${attendee.registration_id}-${index}`}>
                                            <TableCell className="font-medium">
                                                {attendee.full_name}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {attendee.email}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {format(new Date(attendee.scanned_at), 'HH:mm')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(attendee.scanned_at), 'MMM dd')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No attendance data</h3>
                            <p className="text-muted-foreground">
                                No attendees have checked in for Day {selectedDay} yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 
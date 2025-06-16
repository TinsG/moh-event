import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, RefreshCw, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface RegisteredUser {
    id: string
    full_name: string
    email: string
    phone: string
    organization: string
    position: string
    created_at: string
}

type SortKey = keyof Pick<RegisteredUser, 'full_name' | 'email' | 'phone' | 'organization' | 'position' | 'created_at'>

type SortOrder = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function RegisteredUsersTable() {
    const [users, setUsers] = useState<RegisteredUser[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [organization, setOrganization] = useState('all')
    const [orgOptions, setOrgOptions] = useState<string[]>([])
    const [sortKey, setSortKey] = useState<SortKey>('created_at')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false })
        if (!error && data) {
            setUsers(data as RegisteredUser[])
            setOrgOptions([
                ...Array.from(new Set(data.map((u: RegisteredUser) => u.organization))).sort(),
            ])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Reset to first page on search/filter change
    useEffect(() => {
        setPage(1)
    }, [search, organization, pageSize])

    const filteredUsers = useMemo(() => {
        let filtered = users
        if (organization !== 'all') {
            filtered = filtered.filter(u => u.organization === organization)
        }
        if (search.trim()) {
            const s = search.trim().toLowerCase()
            filtered = filtered.filter(
                u =>
                    u.full_name.toLowerCase().includes(s) ||
                    u.email.toLowerCase().includes(s) ||
                    u.organization.toLowerCase().includes(s)
            )
        }
        return filtered
    }, [users, search, organization])

    const sortedUsers = useMemo(() => {
        const sorted = [...filteredUsers]
        sorted.sort((a, b) => {
            if (sortKey === 'created_at') {
                const aDate = new Date(a.created_at)
                const bDate = new Date(b.created_at)
                if (aDate < bDate) return sortOrder === 'asc' ? -1 : 1
                if (aDate > bDate) return sortOrder === 'asc' ? 1 : -1
                return 0
            } else {
                const aValue = (a[sortKey] || '').toString().toLowerCase()
                const bValue = (b[sortKey] || '').toString().toLowerCase()
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
                return 0
            }
        })
        return sorted
    }, [filteredUsers, sortKey, sortOrder])

    const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1
    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize
        return sortedUsers.slice(start, start + pageSize)
    }, [sortedUsers, page, pageSize])

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Organization', 'Position', 'Registered At']
        const csvContent = [
            headers.join(','),
            ...sortedUsers.map(u => [
                `"${u.full_name}"`,
                `"${u.email}"`,
                `"${u.phone}"`,
                `"${u.organization}"`,
                `"${u.position}"`,
                `"${format(new Date(u.created_at), 'yyyy-MM-dd HH:mm')}"`
            ].join(','))
        ].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'registered-users.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortOrder('asc')
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        setPage(newPage)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-between">
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search name, email, or organization..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-64"
                        disabled={loading}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
                        <SelectTrigger className="w-28">
                            <SelectValue>Rows: {pageSize}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <SelectItem key={size} value={String(size)}>{size} per page</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToCSV} disabled={sortedUsers.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                                Name {sortKey === 'full_name' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                                Email {sortKey === 'email' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('phone')}>
                                Phone {sortKey === 'phone' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('organization')}>
                                Organization {sortKey === 'organization' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('position')}>
                                Position {sortKey === 'position' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                                Registered At {sortKey === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading registered users...
                                </TableCell>
                            </TableRow>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{user.organization}</TableCell>
                                    <TableCell>{user.position}</TableCell>
                                    <TableCell>{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No registered users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({sortedUsers.length} users)
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(1)} disabled={page === 1} aria-label="First page">
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
                        <ChevronLeft className="h-4 w-4 " />
                    </Button>
                    <span className="px-2 py-1 text-sm font-mono">{page}</span>
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
} 
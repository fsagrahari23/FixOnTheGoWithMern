import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import {
    CreditCard,
    Search,
    Eye,
    DollarSign,
    User,
    Wrench,
    CheckCircle,
    Clock,
    RefreshCcw,
    TrendingUp,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function Payments() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [payments, setPayments] = useState([])
    const [stats, setStats] = useState({})
    const [pagination, setPagination] = useState({})
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

    useEffect(() => {
        fetchPayments()
    }, [statusFilter, currentPage])

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                ...(statusFilter !== 'all' && { status: statusFilter }),
            })
            const response = await fetch(`${API_BASE}/staff/payments?${params}`, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch payments')
            }
            const data = await response.json()
            setPayments(data.payments || [])
            setStats(data.stats || {})
            setPagination(data.pagination || {})
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredPayments = payments.filter((payment) => {
        const searchLower = search.toLowerCase()
        return (
            payment.user?.name?.toLowerCase().includes(searchLower) ||
            payment.user?.email?.toLowerCase().includes(searchLower) ||
            payment.mechanic?.name?.toLowerCase().includes(searchLower) ||
            payment._id?.toLowerCase().includes(searchLower)
        )
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'default'
            case 'pending':
                return 'secondary'
            case 'refunded':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    if (loading && payments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Payments</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-8 mt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                        <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Payment Management</h1>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-green-100 mb-1">Total Revenue</p>
                                <h3 className="text-2xl font-bold">
                                    ₹{(stats.totalRevenue || 0).toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-blue-100 mb-1">Completed</p>
                                <h3 className="text-2xl font-bold">{stats.completed || 0}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-yellow-100 mb-1">Pending</p>
                                <h3 className="text-2xl font-bold">{stats.pending || 0}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-red-100 mb-1">Refunded</p>
                                <h3 className="text-2xl font-bold">{stats.refunded || 0}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by user, mechanic, or booking ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredPayments.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Booking ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Mechanic</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Booking Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((payment) => (
                                        <TableRow key={payment._id}>
                                            <TableCell className="font-mono text-sm">
                                                {payment._id.slice(-8)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span>{payment.user?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="w-4 h-4 text-muted-foreground" />
                                                    <span>{payment.mechanic?.name || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    ₹{payment.payment?.amount || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(payment.payment?.status)}>
                                                    {payment.payment?.status || 'pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{payment.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setDetailsDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={currentPage >= pagination.pages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No payments found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>
                            View detailed payment and booking information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <User className="w-4 h-4" /> User
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium truncate">{selectedPayment.user?.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {selectedPayment.user?.email}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Wrench className="w-4 h-4" /> Mechanic
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium truncate">
                                            {selectedPayment.mechanic?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {selectedPayment.mechanic?.email || ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Booking ID
                                    </label>
                                    <p className="font-mono text-xs sm:text-sm break-all">{selectedPayment._id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Problem Category
                                    </label>
                                    <p className="font-medium">{selectedPayment.problemCategory}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Booking Status
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{selectedPayment.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Amount
                                        </label>
                                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                                            ₹{selectedPayment.payment?.amount || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </label>
                                        <div className="mt-1">
                                            <Badge variant={getStatusColor(selectedPayment.payment?.status)}>
                                                {selectedPayment.payment?.status || 'pending'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Transaction ID
                                        </label>
                                        <p className="font-mono text-xs sm:text-sm break-all">
                                            {selectedPayment.payment?.transactionId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.premiumDiscount?.isApplied && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Premium Discount Applied:</strong>{' '}
                                        {selectedPayment.premiumDiscount.rate}% off (
                                        {selectedPayment.premiumDiscount.plan} plan)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

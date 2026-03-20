import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
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
    AlertTriangle,
    Search,
    Eye,
    CheckCircle,
    MessageSquare,
    User,
    Wrench,
    DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function Disputes() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [disputes, setDisputes] = useState([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedDispute, setSelectedDispute] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [resolution, setResolution] = useState({
        resolution: '',
        refundAmount: 0,
        notes: '',
    })

    useEffect(() => {
        fetchDisputes()
    }, [])

    const fetchDisputes = async () => {
        try {
            const response = await fetch(`${API_BASE}/staff/disputes`, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch disputes')
            }
            const data = await response.json()
            setDisputes(data.disputedBookings || [])
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResolve = async () => {
        if (!selectedDispute || !resolution.resolution) {
            toast.error('Please provide a resolution')
            return
        }
        setActionLoading(true)
        try {
            const response = await fetch(
                `${API_BASE}/staff/dispute/${selectedDispute._id}/resolve`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resolution),
                    credentials: 'include',
                }
            )
            if (!response.ok) {
                throw new Error('Failed to resolve dispute')
            }
            toast.success('Dispute resolved successfully!')
            setResolveDialogOpen(false)
            setSelectedDispute(null)
            setResolution({ resolution: '', refundAmount: 0, notes: '' })
            fetchDisputes()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const filteredDisputes = disputes.filter((dispute) => {
        const searchLower = search.toLowerCase()
        const matchesSearch =
            dispute.user?.name?.toLowerCase().includes(searchLower) ||
            dispute.user?.email?.toLowerCase().includes(searchLower) ||
            dispute.mechanic?.name?.toLowerCase().includes(searchLower) ||
            dispute.dispute?.reason?.toLowerCase().includes(searchLower)

        const matchesStatus =
            statusFilter === 'all' || dispute.dispute?.status === statusFilter

        return matchesSearch && matchesStatus
    })

    if (loading) {
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
                        <BreadcrumbPage>Disputes</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-8 mt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dispute Resolution</h1>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by user, mechanic, or reason..."
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
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under-review">Under Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Disputes Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Active Disputes ({filteredDisputes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredDisputes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Mechanic</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDisputes.map((dispute) => (
                                    <TableRow key={dispute._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{dispute.user?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {dispute.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Wrench className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">
                                                        {dispute.mechanic?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {dispute.mechanic?.email || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="truncate max-w-[200px]">
                                                {dispute.dispute?.reason || 'No reason provided'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    dispute.dispute?.status === 'pending'
                                                        ? 'destructive'
                                                        : dispute.dispute?.status === 'under-review'
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                            >
                                                {dispute.dispute?.status || 'pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                ₹{dispute.payment?.amount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                dispute.dispute?.createdAt || dispute.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedDispute(dispute)
                                                        setDetailsDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {dispute.dispute?.status !== 'resolved' && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => {
                                                            setSelectedDispute(dispute)
                                                            setResolveDialogOpen(true)
                                                        }}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No disputes found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dispute Details</DialogTitle>
                        <DialogDescription>
                            Review the booking and dispute information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDispute && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <User className="w-4 h-4" /> User
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{selectedDispute.user?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDispute.user?.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDispute.user?.phone}
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
                                        <p className="font-medium">
                                            {selectedDispute.mechanic?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDispute.mechanic?.email || ''}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDispute.mechanic?.phone || ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Problem Category
                                    </label>
                                    <p className="font-medium">{selectedDispute.problemCategory}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Booking Status
                                    </label>
                                    <Badge variant="outline">{selectedDispute.status}</Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Payment Amount
                                    </label>
                                    <p className="font-medium">₹{selectedDispute.payment?.amount || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Payment Status
                                    </label>
                                    <Badge
                                        variant={
                                            selectedDispute.payment?.status === 'completed'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {selectedDispute.payment?.status || 'pending'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Description
                                </label>
                                <p className="mt-1 p-3 bg-muted rounded-lg">
                                    {selectedDispute.description}
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    Dispute Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Reason
                                        </label>
                                        <p className="font-medium">
                                            {selectedDispute.dispute?.reason || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </label>
                                        <Badge variant="destructive">
                                            {selectedDispute.dispute?.status || 'pending'}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedDispute.dispute?.description && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Description
                                        </label>
                                        <p className="mt-1 p-3 bg-red-50 rounded-lg text-red-800">
                                            {selectedDispute.dispute.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                            Close
                        </Button>
                        {selectedDispute?.dispute?.status !== 'resolved' && (
                            <Button
                                onClick={() => {
                                    setDetailsDialogOpen(false)
                                    setResolveDialogOpen(true)
                                }}
                            >
                                Resolve Dispute
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resolve Dialog */}
            <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Dispute</DialogTitle>
                        <DialogDescription>
                            Provide a resolution for this dispute
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="resolution">Resolution *</Label>
                            <Select
                                value={resolution.resolution}
                                onValueChange={(value) =>
                                    setResolution({ ...resolution, resolution: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="favor-user">In favor of User</SelectItem>
                                    <SelectItem value="favor-mechanic">In favor of Mechanic</SelectItem>
                                    <SelectItem value="partial-refund">Partial Refund</SelectItem>
                                    <SelectItem value="full-refund">Full Refund</SelectItem>
                                    <SelectItem value="no-action">No Action Required</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="refundAmount">Refund Amount (₹)</Label>
                            <Input
                                id="refundAmount"
                                type="number"
                                min="0"
                                value={resolution.refundAmount}
                                onChange={(e) =>
                                    setResolution({
                                        ...resolution,
                                        refundAmount: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional notes about the resolution..."
                                value={resolution.notes}
                                onChange={(e) =>
                                    setResolution({ ...resolution, notes: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResolveDialogOpen(false)
                                setResolution({ resolution: '', refundAmount: 0, notes: '' })
                            }}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleResolve} disabled={actionLoading}>
                            {actionLoading ? 'Resolving...' : 'Resolve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

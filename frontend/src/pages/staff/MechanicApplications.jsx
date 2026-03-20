import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    UserCog,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    FileText,
    Clock,
} from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function MechanicApplications() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pendingMechanics, setPendingMechanics] = useState([])
    const [search, setSearch] = useState('')
    const [selectedMechanic, setSelectedMechanic] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchPendingMechanics()
    }, [])

    const fetchPendingMechanics = async () => {
        try {
            const response = await fetch(`${API_BASE}/staff/mechanics/pending`, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch pending mechanics')
            }
            const data = await response.json()
            setPendingMechanics(data.pendingMechanics || [])
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!selectedMechanic) return
        setActionLoading(true)
        try {
            const response = await fetch(
                `${API_BASE}/staff/mechanic/${selectedMechanic.user._id}/approve`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )
            if (!response.ok) {
                throw new Error('Failed to approve mechanic')
            }
            toast.success('Mechanic approved successfully!')
            setApproveDialogOpen(false)
            setSelectedMechanic(null)
            fetchPendingMechanics()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedMechanic) return
        setActionLoading(true)
        try {
            const response = await fetch(
                `${API_BASE}/staff/mechanic/${selectedMechanic.user._id}/reject`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Application rejected by staff' }),
                    credentials: 'include',
                }
            )
            if (!response.ok) {
                throw new Error('Failed to reject mechanic')
            }
            toast.success('Mechanic application rejected')
            setRejectDialogOpen(false)
            setSelectedMechanic(null)
            fetchPendingMechanics()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const filteredMechanics = pendingMechanics.filter((mechanic) => {
        const searchLower = search.toLowerCase()
        return (
            mechanic.user?.name?.toLowerCase().includes(searchLower) ||
            mechanic.user?.email?.toLowerCase().includes(searchLower) ||
            mechanic.user?.phone?.toLowerCase().includes(searchLower)
        )
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
                        <BreadcrumbPage>Mechanic Applications</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-8 mt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                        <UserCog className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Mechanic Applications</h1>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Applications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Pending Applications ({filteredMechanics.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredMechanics.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Applied On</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMechanics.map((mechanic) => (
                                    <TableRow key={mechanic._id}>
                                        <TableCell className="font-medium">
                                            {mechanic.user?.name}
                                        </TableCell>
                                        <TableCell>{mechanic.user?.email}</TableCell>
                                        <TableCell>{mechanic.user?.phone || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {mechanic.specialization?.slice(0, 2).map((spec, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                                {mechanic.specialization?.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{mechanic.specialization.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{mechanic.experience} years</TableCell>
                                        <TableCell>
                                            {new Date(mechanic.user?.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedMechanic(mechanic)
                                                        setDetailsDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => {
                                                        setSelectedMechanic(mechanic)
                                                        setApproveDialogOpen(true)
                                                    }}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedMechanic(mechanic)
                                                        setRejectDialogOpen(true)
                                                    }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No pending applications</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Mechanic Application Details</DialogTitle>
                        <DialogDescription>
                            Review the mechanic's information and documents
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMechanic && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="font-medium">{selectedMechanic.user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="font-medium">{selectedMechanic.user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="font-medium">{selectedMechanic.user?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Experience</label>
                                    <p className="font-medium">{selectedMechanic.experience} years</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                                    <p className="font-medium">₹{selectedMechanic.hourlyRate}/hr</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Applied On</label>
                                    <p className="font-medium">
                                        {new Date(selectedMechanic.user?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedMechanic.specialization?.map((spec, i) => (
                                        <Badge key={i} variant="secondary">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedMechanic.notes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedMechanic.notes}</p>
                                </div>
                            )}

                            {selectedMechanic.documents?.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Documents</label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {selectedMechanic.documents.map((doc, i) => (
                                            <a
                                                key={i}
                                                href={doc}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <span className="text-sm">Document {i + 1}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                            Close
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                setDetailsDialogOpen(false)
                                setApproveDialogOpen(true)
                            }}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setDetailsDialogOpen(false)
                                setRejectDialogOpen(true)
                            }}
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Mechanic</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve {selectedMechanic?.user?.name}'s application?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveDialogOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject {selectedMechanic?.user?.name}'s application?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectDialogOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

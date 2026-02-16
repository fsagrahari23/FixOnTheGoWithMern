import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
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
    Shield,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    KeyRound,
    UserPlus,
    Copy,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function StaffManagement() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [staff, setStaff] = useState([])
    const [search, setSearch] = useState('')
    const [selectedStaff, setSelectedStaff] = useState(null)
    
    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
    
    const [actionLoading, setActionLoading] = useState(false)
    const [createdCredentials, setCreatedCredentials] = useState(null)
    
    // Form states
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        aadhaarNumber: '',
        panNumber: '',
        address: '',
        dateOfBirth: '',
        emergencyContact: '',
        notes: '',
    })
    
    const [editForm, setEditForm] = useState({})
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/api/staff`, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch staff')
            }
            const data = await response.json()
            setStaff(data.staff || [])
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStaff = async () => {
        if (!createForm.name || !createForm.email || !createForm.password) {
            toast.error('Name, email, and password are required')
            return
        }
        if (createForm.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        
        setActionLoading(true)
        try {
            const response = await fetch(`${API_BASE}/admin/api/staff/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
                credentials: 'include',
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create staff')
            }
            toast.success('Staff member created successfully!')
            setCreateDialogOpen(false)
            setCreatedCredentials(data.credentials)
            setCredentialsDialogOpen(true)
            setCreateForm({
                name: '',
                email: '',
                password: '',
                phone: '',
                aadhaarNumber: '',
                panNumber: '',
                address: '',
                dateOfBirth: '',
                emergencyContact: '',
                notes: '',
            })
            fetchStaff()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdateStaff = async () => {
        if (!selectedStaff) return
        setActionLoading(true)
        try {
            const response = await fetch(`${API_BASE}/admin/api/staff/${selectedStaff._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to update staff')
            }
            toast.success('Staff member updated successfully!')
            setEditDialogOpen(false)
            fetchStaff()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!selectedStaff || !newPassword) return
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setActionLoading(true)
        try {
            const response = await fetch(
                `${API_BASE}/admin/api/staff/${selectedStaff._id}/reset-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword }),
                    credentials: 'include',
                }
            )
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password')
            }
            toast.success('Password reset successfully!')
            setResetPasswordDialogOpen(false)
            setCreatedCredentials(data.credentials)
            setCredentialsDialogOpen(true)
            setNewPassword('')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleStatus = async (staffMember) => {
        try {
            const response = await fetch(
                `${API_BASE}/admin/api/staff/${staffMember._id}/toggle-status`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )
            if (!response.ok) {
                throw new Error('Failed to update status')
            }
            toast.success(`Staff member ${staffMember.isActive ? 'deactivated' : 'activated'}!`)
            fetchStaff()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleDeleteStaff = async () => {
        if (!selectedStaff) return
        setActionLoading(true)
        try {
            const response = await fetch(`${API_BASE}/admin/api/staff/${selectedStaff._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to delete staff')
            }
            toast.success('Staff member deleted successfully!')
            setDeleteDialogOpen(false)
            setSelectedStaff(null)
            fetchStaff()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    const filteredStaff = staff.filter((s) => {
        const searchLower = search.toLowerCase()
        return (
            s.name?.toLowerCase().includes(searchLower) ||
            s.email?.toLowerCase().includes(searchLower) ||
            s.phone?.toLowerCase().includes(searchLower)
        )
    })

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
        let password = ''
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return password
    }

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
                        <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Staff Management</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-8 mt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Staff Management</h1>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                </Button>
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

            {/* Staff Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Staff Members ({filteredStaff.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredStaff.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStaff.map((s) => (
                                    <TableRow key={s._id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                        <TableCell>{s.phone || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.isActive ? 'default' : 'secondary'}>
                                                {s.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {s.mustChangePassword && (
                                                <Badge variant="outline" className="ml-2">
                                                    Password Change Required
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(s.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedStaff(s)
                                                        setDetailsDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedStaff(s)
                                                        setEditForm({
                                                            name: s.name,
                                                            phone: s.phone || '',
                                                            aadhaarNumber: s.staffCredentials?.aadhaarNumber || '',
                                                            panNumber: s.staffCredentials?.panNumber || '',
                                                            address: s.staffCredentials?.address || '',
                                                            emergencyContact: s.staffCredentials?.emergencyContact || '',
                                                            notes: s.staffCredentials?.notes || '',
                                                        })
                                                        setEditDialogOpen(true)
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedStaff(s)
                                                        setNewPassword(generatePassword())
                                                        setResetPasswordDialogOpen(true)
                                                    }}
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={s.isActive ? 'secondary' : 'default'}
                                                    onClick={() => handleToggleStatus(s)}
                                                >
                                                    {s.isActive ? (
                                                        <XCircle className="w-4 h-4" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedStaff(s)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No staff members found</p>
                            <Button
                                className="mt-4"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add First Staff Member
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Staff Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>
                            Create a new staff account. The staff member will need to change their password on first login.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    type="text"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    placeholder="Enter password"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateForm({ ...createForm, password: generatePassword() })}
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                            <Input
                                id="aadhaarNumber"
                                value={createForm.aadhaarNumber}
                                onChange={(e) => setCreateForm({ ...createForm, aadhaarNumber: e.target.value })}
                                placeholder="Enter Aadhaar number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="panNumber">PAN Number</Label>
                            <Input
                                id="panNumber"
                                value={createForm.panNumber}
                                onChange={(e) => setCreateForm({ ...createForm, panNumber: e.target.value })}
                                placeholder="Enter PAN number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={createForm.dateOfBirth}
                                onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                                id="emergencyContact"
                                value={createForm.emergencyContact}
                                onChange={(e) => setCreateForm({ ...createForm, emergencyContact: e.target.value })}
                                placeholder="Enter emergency contact"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={createForm.address}
                                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                placeholder="Enter address"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={createForm.notes}
                                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateStaff} disabled={actionLoading}>
                            {actionLoading ? 'Creating...' : 'Create Staff'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credentials Dialog */}
            <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Staff Credentials
                        </DialogTitle>
                        <DialogDescription>
                            Share these credentials with the staff member. They will need to change their password on first login.
                        </DialogDescription>
                    </DialogHeader>
                    {createdCredentials && (
                        <div className="space-y-4 p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-mono font-medium">{createdCredentials.email}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(createdCredentials.email)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Temporary Password</p>
                                    <p className="font-mono font-medium">{createdCredentials.tempPassword}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(createdCredentials.tempPassword)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        copyToClipboard(
                                            `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.tempPassword}`
                                        )
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy All
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setCredentialsDialogOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Staff Details</DialogTitle>
                    </DialogHeader>
                    {selectedStaff && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{selectedStaff.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedStaff.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedStaff.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={selectedStaff.isActive ? 'default' : 'secondary'}>
                                        {selectedStaff.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            {selectedStaff.staffCredentials && (
                                <>
                                    <hr />
                                    <h4 className="font-medium">Credentials</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                                            <p className="font-medium">
                                                {selectedStaff.staffCredentials.aadhaarNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">PAN Number</p>
                                            <p className="font-medium">
                                                {selectedStaff.staffCredentials.panNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Emergency Contact</p>
                                            <p className="font-medium">
                                                {selectedStaff.staffCredentials.emergencyContact || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                                            <p className="font-medium">
                                                {selectedStaff.staffCredentials.dateOfBirth
                                                    ? new Date(selectedStaff.staffCredentials.dateOfBirth).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">
                                                {selectedStaff.staffCredentials.address || 'N/A'}
                                            </p>
                                        </div>
                                        {selectedStaff.staffCredentials.notes && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-muted-foreground">Notes</p>
                                                <p className="font-medium">{selectedStaff.staffCredentials.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-aadhaar">Aadhaar Number</Label>
                            <Input
                                id="edit-aadhaar"
                                value={editForm.aadhaarNumber || ''}
                                onChange={(e) => setEditForm({ ...editForm, aadhaarNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-pan">PAN Number</Label>
                            <Input
                                id="edit-pan"
                                value={editForm.panNumber || ''}
                                onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-emergency">Emergency Contact</Label>
                            <Input
                                id="edit-emergency"
                                value={editForm.emergencyContact || ''}
                                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={editForm.notes || ''}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStaff} disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Generate a new password for {selectedStaff?.name}. They will need to change it on next login.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="new-password"
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setNewPassword(generatePassword())}
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword} disabled={actionLoading}>
                            {actionLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Staff Member
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteStaff} disabled={actionLoading}>
                            {actionLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

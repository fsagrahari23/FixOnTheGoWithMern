import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Alert, AlertDescription } from '../../components/ui/alert'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { User, Mail, Phone, Shield, Calendar, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function StaffProfile() {
    const { user } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        })
        setError(null)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setError('All fields are required')
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setError('New password must be at least 6 characters long')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        setPasswordLoading(true)

        try {
            const response = await fetch(`${API_BASE}/staff/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordForm),
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password')
            }

            setSuccess('Password changed successfully!')
            toast.success('Password changed successfully!')
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    const getUserInitials = () => {
        if (!user?.email) return 'S'
        return user.email.substring(0, 2).toUpperCase()
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
                        <BreadcrumbPage>Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-8 mt-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                    <User className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Staff Information
                        </CardTitle>
                        <CardDescription>
                            Your account details and role information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-semibold">{user?.email?.split('@')[0] || 'Staff Member'}</h3>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Staff
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Account Status</p>
                                    <p className="font-medium text-green-600">Active</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-yellow-500" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password for security
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="mb-4 border-green-500 bg-green-500/10">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    disabled={passwordLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    disabled={passwordLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters long
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    disabled={passwordLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Changing Password...
                                    </span>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { logout } from '../../store/slices/authThunks'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function ChangePassword() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('All fields are required')
            return
        }

        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_BASE}/staff/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password')
            }

            setSuccess(true)
            toast.success('Password changed successfully! Please login with your new password.')
            
            // Logout and redirect to login page after successful password change
            setTimeout(() => {
                dispatch(logout())
                navigate('/login')
            }, 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-yellow-500/10 w-fit">
                        <Lock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">Change Your Password</CardTitle>
                    <CardDescription>
                        For security reasons, you must change your password before accessing the staff dashboard.
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
                                Password changed successfully! Redirecting to login page...
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter your new password"
                                disabled={loading || success}
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
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                disabled={loading || success}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || success}
                        >
                            {loading ? (
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
    )
}

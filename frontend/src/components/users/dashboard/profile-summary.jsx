import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { User, Phone, MapPin, Edit } from "lucide-react"
import { apiGet } from "../../../lib/api"
import { useNavigate } from "react-router-dom"

export function ProfileSummary() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                setLoading(true)
                const res = await apiGet("/user/api/profile")
                if (mounted) setUser(res?.user || null)
            } catch (e) {
                console.error("User profile load failed", e)
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => (mounted = false)
    }, [])

    const initials = (user?.name || "U").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted animate-pulse mx-auto" />
                        <div className="h-4 w-40 bg-muted rounded mx-auto" />
                        <div className="h-3 w-52 bg-muted rounded mx-auto" />
                    </div>
                ) : user ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                {initials}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground">{user.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="text-foreground">{user.address || "Not provided"}</span>
                            </div>
                        </div>

                        <Button className="w-full bg-transparent" variant="outline" onClick={() => navigate("/users/profile") }>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Unable to load profile.</p>
                )}
            </CardContent>
        </Card>
    )
}

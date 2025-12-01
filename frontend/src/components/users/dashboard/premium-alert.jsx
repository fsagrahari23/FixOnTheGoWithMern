import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "../../ui/alert"
import { Info } from "lucide-react"
import { Button } from "../../ui/button"
import { apiGet } from "../../../lib/api"
import { useNavigate } from "react-router-dom"

export function PremiumAlert() {
    const [isPremium, setIsPremium] = useState(false)
    const [remaining, setRemaining] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await apiGet("/user/api/dashboard")
                if (!mounted) return
                let premium = res?.isPremium
                if (premium === undefined) {
                    // Fallback inference if field name or shape differs
                    premium = !!res?.subscription || String(res?.remainingBookings).toLowerCase() === "unlimited"
                }
                setIsPremium(!!premium)
                const rem = res?.remainingBookings
                if (rem === undefined) {
                    // Try profile endpoint for remaining bookings as a fallback
                    try {
                        const prof = await apiGet("/user/api/profile")
                        if (!mounted) return
                        setRemaining(prof?.remainingBookings ?? "-")
                        if (premium === undefined) {
                            const p = prof?.isPremium || String(prof?.remainingBookings).toLowerCase() === "unlimited"
                            setIsPremium(!!p)
                        }
                    } catch {
                        setRemaining("-")
                    }
                } else {
                    setRemaining(rem)
                }
            } catch (e) {
                console.error("Premium banner load failed", e)
                setError(e)
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => (mounted = false)
    }, [])

    if (loading || isPremium) return null

    return (
        <Alert className="mb-6 border-blue-400/30 bg-blue-50/50 backdrop-blur-sm dark:bg-blue-500/10 dark:border-blue-500/30">
            <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                    <AlertDescription>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">Basic User Booking Limit</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            You have
                            {remaining === "Unlimited" ? (
                                <span className="ml-1 font-semibold text-blue-700 dark:text-blue-300">Unlimited</span>
                            ) : (
                                <span className="ml-1 font-semibold text-blue-700 dark:text-blue-300">{String(remaining)}/2</span>
                            )}
                            {" "}active bookings remaining.
                        </p>
                    </AlertDescription>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/user/premium")}
                        className="border-blue-500/80 text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-500/20"
                    >
                        Upgrade to Premium
                    </Button>
                </div>
            </div>
        </Alert>
    )
}

import { Alert, AlertDescription } from "../../ui/alert"
import { Info } from "lucide-react"
import { Button } from "../../ui/button"

export function PremiumAlert() {
    const isPremium = false
    const remainingBookings = 1

    if (isPremium) return null

    return (
        <Alert
            className="
        mb-6 
        border-blue-400/30 
        bg-blue-50/50 
        backdrop-blur-sm
        dark:bg-blue-500/10
        dark:border-blue-500/30
      "
        >
            <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />

                <div className="flex-1 space-y-2">
                    <AlertDescription>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                            Basic User Booking Limit
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            You have{" "}
                            <span className="font-semibold text-blue-700 dark:text-blue-300">
                                {remainingBookings}/2
                            </span>{" "}
                            active bookings remaining.
                        </p>
                    </AlertDescription>

                    <Button
                        size="sm"
                        variant="outline"
                        className="
              border-blue-500/80 
              text-blue-600 
              hover:bg-blue-100
              dark:text-blue-300
              dark:border-blue-400
              dark:hover:bg-blue-500/20
            "
                    >
                        Upgrade to Premium
                    </Button>
                </div>
            </div>
        </Alert>
    )
}

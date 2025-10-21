import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Plus, History, LogOut, Zap } from "lucide-react"

export function QuickActions() {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    <Button className="w-full justify-start" size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Book a Mechanic
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" size="lg">
                        <History className="w-4 h-4 mr-2" />
                        View Booking History
                    </Button>
                    <Button
                        className="w-full justify-start bg-transparent text-destructive hover:text-destructive "
                        variant="outline"
                        size="lg"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { History, Settings, MessageSquare, Zap } from "lucide-react"
import { Link } from 'react-router-dom';

export function QuickActions() {
    return (
        <Card className="border border-border shadow-lg dark:shadow-xl">
            <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    <Link to="/mechanic/bookings">
                        <Button className="w-full justify-start" size="lg">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Booking Details
                        </Button>
                    </Link>
                    <Link to="/mechanic/history">
                        <Button className="w-full justify-start bg-transparent" variant="outline" size="lg">
                            <History className="w-4 h-4 mr-2" />
                            View History
                        </Button>
                    </Link>
                    <Link to="/mechanic/profile">
                        <Button className="w-full justify-start bg-transparent" variant="outline" size="lg">
                            <Settings className="w-4 h-4 mr-2" />
                            Update Profile
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

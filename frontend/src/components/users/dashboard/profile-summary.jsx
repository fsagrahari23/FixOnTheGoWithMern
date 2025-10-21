import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { User, Phone, MapPin, Edit } from "lucide-react"

const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Springfield, IL 62701",
    initial: "A",
}

export function ProfileSummary() {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                        {user.initial}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{user.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{user.address}</span>
                    </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </CardContent>
        </Card>
    )
}

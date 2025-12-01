import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { User, Phone, MapPin, Edit, Wrench } from "lucide-react"
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

export function ProfileSummary() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiGet('/mechanic/api/profile');
                setProfile(response.profile);
                setUser(response.user);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleToggleAvailability = async () => {
        try {
            await apiPost('/mechanic/toggle-availability');
            setProfile(prev => ({ ...prev, availability: !prev.availability }));
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    if (!profile || !user) return null;

    return (
        <Card className="border border-border shadow-lg dark:shadow-xl">
            <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                        {user.name ? user.name[0].toUpperCase() : 'M'}
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
                    <div className="flex items-center gap-3 text-sm">
                        <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{profile.specialization?.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{profile.experience} years experience</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleToggleAvailability}
                        className={`w-full ${profile.availability
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                        {profile.availability ? 'Go Offline' : 'Go Online'}
                    </Button>

                    <Button className="w-full bg-transparent" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

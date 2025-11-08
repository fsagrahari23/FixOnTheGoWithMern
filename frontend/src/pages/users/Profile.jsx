import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, Mail, Phone, MapPin, Calendar, Package, 
  Crown, Shield, Lock, Save, ArrowLeft, Key,
  CheckCircle2, Zap, TrendingUp, Settings, Moon, Sun
} from 'lucide-react';

export default function UserProfile() {
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Anderson',
    email: 'john.anderson@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, San Francisco, CA 94102',
    memberSince: '2023-01-15',
    totalBookings: 47,
    isPremium: true,
    premiumPlan: 'premium',
    premiumExpiry: '2025-12-31',
    location: {
      lat: 37.7749,
      lng: -122.4194
    }
  });

  const [formData, setFormData] = useState({
    name: userData.name,
    phone: userData.phone,
    address: userData.address,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    // Handle profile update
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Password updated');
    // Handle password update
  };

  const premiumFeatures = [
    { icon: Zap, label: 'Priority Service', active: true },
    { icon: MapPin, label: 'Real-time Tracking', active: true },
    { icon: TrendingUp, label: '25% Discount', active: true },
    { icon: Shield, label: 'Emergency Assistance', active: true },
    { icon: Package, label: 'Free Towing (3x)', active: true },
    { icon: Settings, label: 'Maintenance Checks', active: true }
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </Button>
              <Button variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white text-2xl font-bold">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userData.name}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{userData.email}</p>
                    
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white px-4 py-1">
                      <Crown className="mr-1 h-3 w-3" />
                      {userData.isPremium ? 'Premium Member' : 'Basic Member'}
                    </Badge>
                    
                    <div className="w-full mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Member Since</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(userData.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Total Bookings</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{userData.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Membership Status */}
              {userData.isPremium ? (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white">
                      <Crown className="mr-2 h-5 w-5 text-amber-500 dark:text-amber-400" />
                      Premium Benefits
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                      Active until {new Date(userData.premiumExpiry).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                          <feature.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.label}</span>
                        {feature.active && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                        )}
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-2">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600">
                        Change Plan
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 dark:border-slate-700">
                        Cancel Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 dark:bg-slate-900">
                  <CardContent className="pt-6 text-center">
                    <Crown className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Upgrade to Premium</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Unlock exclusive features and benefits</p>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-700 dark:hover:to-orange-700">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Stats Card */}
              <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Active Bookings</span>
                    <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                    <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">44</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Cancelled</span>
                    <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">0</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 dark:bg-slate-900 dark:border dark:border-slate-800">
                  <TabsTrigger value="profile" className="text-sm font-medium dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-sm font-medium dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">
                    <Lock className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                  <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">Personal Information</CardTitle>
                      <CardDescription className="dark:text-slate-400">Update your account details and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center text-slate-700 dark:text-slate-300">
                              <User className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center text-slate-700 dark:text-slate-300">
                              <Mail className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              value={userData.email}
                              disabled
                              className="h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-500">Email cannot be changed</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center text-slate-700 dark:text-slate-300">
                              <Phone className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter phone number"
                              className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberSince" className="flex items-center text-slate-700 dark:text-slate-300">
                              <Calendar className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Member Since
                            </Label>
                            <Input
                              id="memberSince"
                              value={new Date(userData.memberSince).toLocaleDateString()}
                              disabled
                              className="h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center text-slate-700 dark:text-slate-300">
                            <MapPin className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            Address
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your address"
                            className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                          />
                        </div>

                        {/* Location Map Placeholder */}
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Location</Label>
                          <div className="relative h-64 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center space-y-2">
                                <MapPin className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {userData.address}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  Lat: {userData.location.lat}, Lng: {userData.location.lng}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                            💡 Drag the marker on the map to update your location coordinates
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={handleProfileSubmit}
                            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button type="button" variant="outline" className="h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-6">
                  <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">Change Password</CardTitle>
                      <CardDescription className="dark:text-slate-400">Ensure your account is using a strong password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="flex items-center text-slate-700 dark:text-slate-300">
                            <Lock className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Enter current password"
                            className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="flex items-center text-slate-700 dark:text-slate-300">
                              <Key className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              New Password
                            </Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              placeholder="Enter new password"
                              className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="flex items-center text-slate-700 dark:text-slate-300">
                              <Key className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Confirm Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm new password"
                              className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>
                        </div>

                        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                          <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                            🔒 Password must be at least 8 characters with uppercase, lowercase, and numbers
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={handlePasswordSubmit}
                            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Update Password
                          </Button>
                          <Button type="button" variant="outline" className="h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Security Options */}
                  <Card className="border-0 shadow-lg mt-6 dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">Two-Factor Authentication</CardTitle>
                      <CardDescription className="dark:text-slate-400">Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-10 w-10 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Authenticator App</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Not configured</p>
                          </div>
                        </div>
                        <Button variant="outline" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

  );
}
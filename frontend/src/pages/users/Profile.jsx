/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import {
  User, Mail, Phone, MapPin, Calendar, Package,
  Crown, Shield, Lock, Save, ArrowLeft, Key,
  CheckCircle2, Zap, TrendingUp, Settings, Moon, Sun, Info
} from 'lucide-react';
import { validate } from '../../lib/validation';
import { apiGet, apiPost } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import MapPicker from '../../components/MapPicker';

export default function UserProfile() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [bookingStats, setBookingStats] = useState({
    active: 0,
    completed: 0,
    cancelled: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [formErrors, setFormErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/user/api/profile');
      const profileData = response;

      setUserData({
        name: profileData.user.name,
        email: profileData.user.email,
        phone: profileData.user.phone || '',
        address: profileData.user.address || '',
        memberSince: profileData.user.createdAt,
        totalBookings: 0, 
        isPremium: profileData.isPremium,
        premiumFeatures: profileData.premiumFeatures || {},
        remainingBookings: profileData.remainingBookings || 0,
        subscription: profileData.subscription,
        subscriptionHistory: profileData.subscriptionHistory || [],
        location: profileData.user.location?.coordinates ? {
          lat: profileData.user.location.coordinates[1],
          lng: profileData.user.location.coordinates[0]
        } : { lat: 0, lng: 0 }
      });

      // Update form data
      setFormData({
        name: profileData.user.name,
        phone: profileData.user.phone || '',
        address: profileData.user.address || '',
        latitude: profileData.user.location?.coordinates ? profileData.user.location.coordinates[1].toString() : '',
        longitude: profileData.user.location?.coordinates ? profileData.user.location.coordinates[0].toString() : '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Fetch booking stats
      await fetchBookingStats();

    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const response = await apiGet('/user/api/dashboard');
      const stats = response.stats;
      setBookingStats({
        active: stats.pending + stats.inProgress,
        completed: stats.completed,
        cancelled: stats.cancelled
      });

      // Update total bookings
      setUserData(prev => ({
        ...prev,
        totalBookings: stats.total
      }));
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const rules = {
      name: [{ type: 'required' }, { type: 'minLength', min: 2 }, { type: 'name' }],
      phone: [{ type: 'phone', message: 'Enter a valid phone number' }],
    };
    const { errors, isValid } = validate(formData, rules);
    setFormErrors(errors);
    if (!isValid) return;

    try {
      await apiPost('/user/api/profile', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        location: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        }
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
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
  
  const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', options);
  };

  const handleMapChange = async (coords) => {
    setFormData(prev => ({
      ...prev,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString()
    }));

    // Reverse geocode to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        address: data.display_name || prev.address
      }));
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const getMappedFeatures = () => {
    if (!userData?.premiumFeatures) return [];
    const { priorityService, tracking, discounts, emergencyAssistance, freeTowing, maintenanceChecks } = userData.premiumFeatures;
    const features = [];
    
    if (priorityService) features.push({ icon: Zap, label: 'Priority Service' });
    if (tracking) features.push({ icon: MapPin, label: 'Real-time Tracking' });
    if (discounts) features.push({ icon: TrendingUp, label: `${discounts}% Discount` });
    if (emergencyAssistance) features.push({ icon: Shield, label: 'Emergency Assistance' });
    if (freeTowing) features.push({ icon: Package, label: `Free Towing (${freeTowing}x)` });
    if (maintenanceChecks) features.push({ icon: Settings, label: 'Maintenance Checks' });
    
    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">{error || 'Failed to load profile'}</p>
            <Button onClick={fetchProfileData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300`}>
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
            <Button variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => navigate('/user/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white text-2xl font-bold">
                      {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userData.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{userData.email}</p>

                  <Badge className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white px-4 py-1">
                    <Crown className="mr-1 h-3 w-3" />
                    {userData.isPremium ? 'Premium Member' : 'Basic Member'}
                  </Badge>

                  <div className="w-full mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Service Location</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={userData.address}>
                        {userData.address || 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Coordinates</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {userData.location?.lat && userData.location?.lng 
                          ? `${userData.location.lat.toFixed(4)}, ${userData.location.lng.toFixed(4)}`
                          : 'N/A'}
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
              <Card className="border-0 shadow-lg bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white">
                        <Crown className="mr-2 h-5 w-5 text-amber-500 dark:text-amber-400" />
                        Premium Plan
                      </CardTitle>
                      <CardDescription className="dark:text-slate-400">
                        {userData.subscription?.plan?.charAt(0).toUpperCase() + userData.subscription?.plan?.slice(1)} Billing
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Remaining Bookings</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {userData.remainingBookings === "Unlimited" ? "Unlimited" : `${userData.remainingBookings} Left`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Features</p>
                    {getMappedFeatures().map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          <feature.icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{feature.label}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 ml-auto" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-slate-500 dark:text-slate-400">Expires On</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(userData.subscription?.expiresAt)}
                        </span>
                      </div>
                    <Button 
                      onClick={() => setActiveTab('subscription')}
                      className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 shadow-lg shadow-blue-500/20"
                    >
                      Manage Subscription
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
                  <Button className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-700 dark:hover:to-orange-700" onClick={() => navigate('/user/premium')}>
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
                  <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">{bookingStats.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                  <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">{bookingStats.completed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Cancelled</span>
                  <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-300">{bookingStats.cancelled}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 md:h-12 bg-slate-100 dark:bg-slate-900/80 p-1 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="profile" className="text-[10px] sm:text-sm font-medium py-2 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">
                  <User className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="truncate">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="text-[10px] sm:text-sm font-medium py-2 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">
                  <Crown className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="truncate">Plan</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="text-[10px] sm:text-sm font-medium py-2 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">
                  <Lock className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="truncate">Security</span>
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
                          {formErrors.name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.name}</p>}
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
                          {formErrors.phone && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.phone}</p>}
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="address" className="flex items-center text-slate-700 dark:text-slate-300">
                              <MapPin className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              Service Address
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isLocating}
                              onClick={() => {
                                setIsLocating(true);
                                if (!navigator.geolocation) {
                                  alert('Geolocation is not supported by your browser');
                                  setIsLocating(false);
                                  return;
                                }
                                
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    const { latitude, longitude } = pos.coords;
                                    handleMapChange({ 
                                      lat: latitude, 
                                      lng: longitude 
                                    });
                                    setIsLocating(false);
                                  },
                                  () => {
                                    alert('Failed to get location. Please check permissions.');
                                    setIsLocating(false);
                                  },
                                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                                );
                              }}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 gap-2 h-8"
                            >
                              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                              <span className="text-xs">{isLocating ? 'Locating...' : 'Use Current Location'}</span>
                            </Button>
                          </div>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your service address"
                            className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                          
                          <div className="mt-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-blue-500" />
                              Adjust your location by dragging the marker or clicking the map
                            </p>
                            <MapPicker
                              onChange={handleMapChange}
                              center={formData.latitude && formData.longitude ? { lat: Number(formData.latitude), lng: Number(formData.longitude) } : null}
                              className="w-full h-64 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="memberSince" className="flex items-center text-slate-700 dark:text-slate-300">
                            <Calendar className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            Member Since
                          </Label>
                          <Input
                            id="memberSince"
                            value={formatDate(userData.memberSince)}
                            disabled
                            className="h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleProfileSubmit}
                          className="flex-1 h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
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

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="mt-6">
                <div className="space-y-6">
                  {/* Active Subscription Details */}
                  <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">Active Plan Status</CardTitle>
                      <CardDescription className="dark:text-slate-400">Detailed information about your current membership</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userData.isPremium ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Current Plan</span>
                              <span className="font-bold text-slate-900 dark:text-white uppercase">{userData.subscription?.plan}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Amount Paid</span>
                              <span className="font-bold text-slate-900 dark:text-white">${userData.subscription?.amount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase">
                                {userData.subscription?.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Start Date</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatDate(userData.subscription?.startDate)}
                              </span>
                            </div>
                             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Next Renewal</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatDate(userData.subscription?.expiresAt)}
                              </span>
                            </div>
                             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Payment Type</span>
                              <span className="font-medium text-slate-900 dark:text-white uppercase">
                                {userData.subscription?.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-400">You don't have an active premium plan.</p>
                          <Button onClick={() => navigate('/user/premium')} className="mt-4">Explore Premium Plans</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Subscription History */}
                  <Card className="border-0 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">Billing History</CardTitle>
                      <CardDescription className="dark:text-slate-400">Track your past transactions and plan changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4">Plan</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {userData.subscriptionHistory && userData.subscriptionHistory.length > 0 ? (
                              userData.subscriptionHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                                    {formatDate(item.startDate)}
                                  </td>
                                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 capitalize">{item.plan}</td>
                                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">${item.amount}</td>
                                  <td className="py-3 px-4">
                                    <Badge variant="secondary" className={cn(
                                      "text-[10px] px-2 py-0.5",
                                      item.status === 'active' ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                                      item.status === 'cancelled' ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                      {item.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-8 text-center text-slate-500 dark:text-slate-400">No billing history found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
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
                          className="flex-1 h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
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
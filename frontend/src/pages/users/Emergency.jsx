import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  Info,
  Phone,
  Loader2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmergencyData, requestEmergency } from '../../store/slices/bookingThunks';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../../components/MapPicker';

const Emergency = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { emergency, subscription, loading, error } = useSelector((state) => state.booking);

  const [formData, setFormData] = useState({
    problemDescription: '',
    address: '',
    latitude: '',
    longitude: '',
    contactNumber: '',
    urgencyLevel: 'high'
  });

  useEffect(() => {
    dispatch(fetchEmergencyData());
  }, [dispatch]);

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
        address: data.display_name || ''
      }));
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert('Please select your location on the map');
      return;
    }

    try {
      const result = await dispatch(requestEmergency(formData)).unwrap();
      if (result.success) {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Emergency request error:', error);
    }
  };

  const hasEmergencyFeature = subscription?.features?.emergencyAssistance;
  const recentEmergency = emergency.recentEmergency?.[0];

  if (!hasEmergencyFeature) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Premium Feature Required</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Emergency roadside assistance is only available for yearly premium subscribers.
            </p>
            <Button onClick={() => navigate('/user/premium')} className="bg-red-500 hover:bg-red-600">
              Upgrade to Premium
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Emergency Roadside Assistance
          </h1>
          <p className="text-slate-600 dark:text-slate-400">24/7 emergency support for premium subscribers</p>
        </div>

        {recentEmergency && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <strong>You have an active emergency request</strong><br />
              You have already requested emergency assistance on {new Date(recentEmergency.createdAt).toLocaleDateString()}.
              Current status: <Badge className="ml-2" variant="destructive">{recentEmergency.status}</Badge>
              <div className="mt-3">
                <Button
                  onClick={() => navigate(`/user/booking/${recentEmergency._id}`)}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600"
                >
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!recentEmergency && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="bg-red-50 dark:bg-slate-700">
                  <CardTitle className="text-xl flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-5 h-5" />
                    Request Emergency Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-300">
                      As a yearly premium member, you have access to 24/7 emergency roadside assistance.
                      Our team will respond immediately to your request.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="problemDescription" className="text-base font-medium">
                        Describe Your Emergency
                      </Label>
                      <Textarea
                        id="problemDescription"
                        name="problemDescription"
                        value={formData.problemDescription}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Please describe the emergency situation (e.g., breakdown, flat tire, accident, etc.)"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="urgencyLevel" className="text-base font-medium">
                        Urgency Level
                      </Label>
                      <select
                        id="urgencyLevel"
                        name="urgencyLevel"
                        value={formData.urgencyLevel}
                        onChange={handleInputChange}
                        className="w-full mt-2 p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                        required
                      >
                        <option value="high">High - Immediate response needed</option>
                        <option value="medium">Medium - Respond within 30 minutes</option>
                        <option value="low">Low - Respond within 1 hour</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="contactNumber" className="text-base font-medium">
                        Contact Number
                      </Label>
                      <Input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your contact number"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-base font-medium">
                        Current Location
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your current address"
                          required
                          className="flex-1"
                        />
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                          Click on the map to select your exact location
                        </Label>
                        <MapPicker
                          onChange={handleMapChange}
                          className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <input type="hidden" name="latitude" value={formData.latitude} />
                      <input type="hidden" name="longitude" value={formData.longitude} />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Request Emergency Help
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/user/dashboard')}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Emergency Services */}
              <Card className="shadow-lg">
                <CardHeader className="bg-slate-50 dark:bg-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Emergency Services Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Our emergency response team provides:
                  </p>

                  <div className="space-y-3">
                    {[
                      { icon: AlertTriangle, text: "Immediate roadside assistance and breakdown help" },
                      { icon: MapPin, text: "Towing service to nearest service center" },
                      { icon: Clock, text: "24/7 availability with rapid response times" },
                      { icon: Phone, text: "Direct communication with emergency coordinator" },
                      { icon: CheckCircle, text: "Priority mechanic dispatch and coordination" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                      Emergency services are prioritized and may incur additional charges based on the service required.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Response Times */}
              <Card className="shadow-lg">
                <CardHeader className="bg-slate-50 dark:bg-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Expected response times based on urgency:
                  </p>

                  <div className="space-y-3">
                    {[
                      { level: 'High Priority', time: 'Within 15 minutes', color: 'text-red-600 dark:text-red-400' },
                      { level: 'Medium Priority', time: 'Within 30 minutes', color: 'text-amber-600 dark:text-amber-400' },
                      { level: 'Low Priority', time: 'Within 1 hour', color: 'text-green-600 dark:text-green-400' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.level}</span>
                        <span className={`text-sm font-semibold ${item.color}`}>{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 text-center">
                      24/7 Emergency Hotline: <br />
                      <span className="text-lg font-bold">+1 (555) 123-HELP</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;

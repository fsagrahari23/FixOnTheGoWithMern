import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wrench,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaintenanceData, scheduleMaintenance } from '../../store/slices/bookingThunks';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../../components/MapPicker';

const Maintenance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { maintenance, subscription, loading, error } = useSelector((state) => state.booking);

  const [formData, setFormData] = useState({
    preferredDate: '',
    address: '',
    latitude: '',
    longitude: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchMaintenanceData());
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
      const result = await dispatch(scheduleMaintenance(formData)).unwrap();
      if (result.success) {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Scheduling error:', error);
    }
  };

  const getQuarterInfo = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    if (month < 3) return { quarter: 'Q1', period: 'January - March', year };
    if (month < 6) return { quarter: 'Q2', period: 'April - June', year };
    if (month < 9) return { quarter: 'Q3', period: 'July - September', year };
    return { quarter: 'Q4', period: 'October - December', year };
  };

  const quarterInfo = getQuarterInfo();
  const hasMaintenanceFeature = subscription?.features?.maintenanceChecks;
  const recentMaintenance = maintenance.recentMaintenance?.[0];

  if (!hasMaintenanceFeature) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Premium Feature Required</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Maintenance checks are only available for yearly premium subscribers.
            </p>
            <Button onClick={() => navigate('/user/premium')} className="bg-blue-500 hover:bg-blue-600">
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
            <Wrench className="w-8 h-8 text-blue-500" />
            Quarterly Maintenance Check
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Premium feature for yearly subscribers</p>
        </div>

        {recentMaintenance && (
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              <strong>You have an active maintenance booking</strong><br />
              You have already scheduled a maintenance check on {new Date(recentMaintenance.createdAt).toLocaleDateString()}.
              Current status: <Badge className="ml-2" variant="outline">{recentMaintenance.status}</Badge>
              <div className="mt-3">
                <Button
                  onClick={() => navigate(`/user/booking/${recentMaintenance._id}`)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!recentMaintenance && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50 dark:bg-slate-700">
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Calendar className="w-5 h-5" />
                    Schedule Your Maintenance Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      As a yearly premium member, you're entitled to quarterly maintenance checks for your bike.
                      Schedule your next check below:
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="preferredDate" className="text-base font-medium">
                        Preferred Date
                      </Label>
                      <Input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-base font-medium">
                        Service Location
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          required
                          className="flex-1"
                        />
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                          Click on the map to select your service location
                        </Label>
                        <MapPicker
                          onChange={handleMapChange}
                          className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <input type="hidden" name="latitude" value={formData.latitude} />
                      <input type="hidden" name="longitude" value={formData.longitude} />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-base font-medium">
                        Special Instructions (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any specific issues you'd like us to check?"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Maintenance
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
              {/* Maintenance Details */}
              <Card className="shadow-lg">
                <CardHeader className="bg-slate-50 dark:bg-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Maintenance Check Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Our professional mechanics will perform the following checks:
                  </p>

                  <div className="space-y-3">
                    {[
                      { icon: Wrench, text: "Drivetrain Check - Chain, cassette, and derailleur inspection" },
                      { icon: Clock, text: "Brake Inspection - Brake pads, cables, and adjustment" },
                      { icon: Star, text: "Tire & Wheel Service - Pressure check, truing, and hub inspection" },
                      { icon: CheckCircle, text: "Safety Check - Frame inspection and components check" },
                      { icon: Wrench, text: "Basic Lubrication - Chain and pivot points lubrication" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                      Any parts that need replacement will be quoted separately. The check itself is included in your premium membership.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Quarterly Schedule */}
              <Card className="shadow-lg">
                <CardHeader className="bg-slate-50 dark:bg-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Quarterly Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    As a yearly premium member, you're entitled to one maintenance check per quarter:
                  </p>

                  <div className="space-y-2">
                    {[
                      { quarter: 'Q1', period: 'January - March', active: quarterInfo.quarter === 'Q1' },
                      { quarter: 'Q2', period: 'April - June', active: quarterInfo.quarter === 'Q2' },
                      { quarter: 'Q3', period: 'July - September', active: quarterInfo.quarter === 'Q3' },
                      { quarter: 'Q4', period: 'October - December', active: quarterInfo.quarter === 'Q4' }
                    ].map((item) => (
                      <div key={item.quarter} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className={`text-sm ${item.active ? 'font-semibold text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {item.quarter}: {item.period}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300 text-center">
                      Your next available check: {quarterInfo.quarter} {quarterInfo.year}
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

export default Maintenance;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import { MapPin, Upload, Wrench, Crown, Info, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Breadcrumb Component
const Breadcrumb = () => (
  <nav className="flex mb-6" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      <li className="inline-flex items-center">
        <a href="/user/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          Dashboard
        </a>
      </li>
      <li>
        <div className="flex items-center">
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Book a Mechanic</span>
        </div>
      </li>
    </ol>
  </nav>
);

// Image Preview Component
const ImagePreview = ({ files }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = [];
    Array.from(files).forEach((file) => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          if (newPreviews.length === files.length) {
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [files]);

  if (previews.length === 0) return null;

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
      {previews.map((preview, index) => (
        <div key={index} className="relative group">
          <img
            src={preview}
            alt={`Preview ${index + 1}`}
            className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
          />
        </div>
      ))}
    </div>
  );
};

// Map Component
const MapComponent = ({ id, height = 300 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapRef.current.querySelector('.map-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'map-placeholder w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg';
      placeholder.innerHTML = `
        <div class="text-center p-4">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Interactive map will display here</p>
        </div>
      `;
      mapRef.current.appendChild(placeholder);
    }
  }, []);

  return (
    <div
      ref={mapRef}
      id={id}
      style={{ height: `${height}px` }}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    />
  );
};

// Premium Alert Component
const PremiumAlert = ({ isPremium, discount }) => {
  if (!isPremium) return null;

  return (
    <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-300">Premium Benefits Active</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-400">
        You'll receive priority service, {discount}% discount, and real-time mechanic tracking!
      </AlertDescription>
    </Alert>
  );
};

// Basic Alert Component
const BasicAlert = ({ isPremium }) => {
  if (isPremium) return null;

  return (
    <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <Info className="h-5 w-5 text-blue-600 dark:text-blue-500" />
      <AlertTitle className="text-blue-800 dark:text-blue-300">Basic User Booking Limit</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-400">
        Basic users are limited to 2 active bookings at a time.{' '}
        <a href="/user/premium" className="font-bold underline hover:text-blue-900 dark:hover:text-blue-200">
          Upgrade to Premium
        </a>{' '}
        for unlimited bookings.
      </AlertDescription>
    </Alert>
  );
};

// Towing Details Component
const TowingDetails = ({ showTowing, formData, handleInputChange, errors }) => {
  if (!showTowing) return null;

  return (
    <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Towing Details</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="pickupAddress" className="dark:text-gray-200">Pickup Location</Label>
            <Input
              id="pickupAddress"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleInputChange}
              placeholder="Enter pickup address"
              className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Default is your current location.
            </p>
          </div>

          <div>
            <Label htmlFor="dropoffAddress" className="dark:text-gray-200">
              Dropoff Location
            </Label>
            <Input
              id="dropoffAddress"
              name="dropoffAddress"
              value={formData.dropoffAddress}
              onChange={handleInputChange}
              placeholder="Enter dropoff address"
              className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Where should your bike be towed to?
            </p>
            {errors.dropoff && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dropoff}
              </p>
            )}
          </div>

          <MapComponent id="towing-map" height={200} />
        </div>
      </CardContent>
    </Card>
  );
};

// Main Booking Form Component
const BookingForm = () => {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [discount, setDiscount] = useState(10);
  const [showTowing, setShowTowing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    problemCategory: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    requiresTowing: false,
    pickupAddress: '',
    pickupLatitude: '',
    pickupLongitude: '',
    dropoffAddress: '',
    dropoffLatitude: '',
    dropoffLongitude: '',
  });

  useEffect(() => {
    // Simulate API call
    const loadUserData = async () => {
      // Mock data - replace with actual API call
      const mockData = {
        user: {
          address: '123 Main St, City',
          location: {
            coordinates: [78.9629, 20.5937]
          }
        },
        isPremium: false,
        plan: 'monthly'
      };

      setIsPremium(mockData.isPremium);
      setDiscount(mockData.plan === 'monthly' ? 10 : 15);
      setFormData(prev => ({
        ...prev,
        address: mockData.user.address || '',
        latitude: mockData.user.location?.coordinates?.[1] || '',
        longitude: mockData.user.location?.coordinates?.[0] || '',
      }));
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, problemCategory: value }));
    if (errors.problemCategory) {
      setErrors(prev => ({ ...prev, problemCategory: '' }));
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleTowingToggle = (checked) => {
    setShowTowing(checked);
    setFormData(prev => ({ ...prev, requiresTowing: checked }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            pickupLatitude: lat,
            pickupLongitude: lng,
          }));
          // In real implementation, update the map and reverse geocode
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.problemCategory) {
      newErrors.problemCategory = 'Please select a problem category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the problem';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please provide a valid location';
    }

    if (formData.requiresTowing && (!formData.dropoffLatitude || !formData.dropoffLongitude)) {
      newErrors.dropoff = 'Please provide a valid dropoff location';
    }

    // Validate uploaded images (optional) — max 5MB each, must be images
    if (selectedFiles && selectedFiles.length > 0) {
      const maxMB = 5 * 1024 * 1024;
      for (const f of Array.from(selectedFiles)) {
        if (f.size > maxMB) { newErrors.images = 'Each image must be under 5MB'; break; }
        if (!f.type.startsWith('image/')) { newErrors.images = 'Only image files are allowed'; break; }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstError);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Prepare FormData for file uploads
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images if any
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file, index) => {
          formDataToSend.append('images', file);
        });
      }

      // Use fetch directly for FormData
      const response = await fetch('/user/book', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const res = await response.json();

      // Navigate to booking details
      if (res && res._id) {
        navigate(`/user/booking/${res._id}`);
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      alert('Failed to submit booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb />

        <Card className="shadow-lg dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="border-b dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardTitle className="flex items-center gap-2 text-2xl dark:text-white">
              <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Book a Mechanic
              {isPremium && (
                <Badge variant="secondary" className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 bg-white dark:bg-gray-900">
            <PremiumAlert isPremium={isPremium} discount={discount} />
            <BasicAlert isPremium={isPremium} />

            <div className="space-y-6">
              {/* Problem Category */}
              <div>
                <Label htmlFor="problemCategory" className="dark:text-gray-200">
                  Problem Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.problemCategory} onValueChange={handleSelectChange}>
                  <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="Flat Tire">Flat Tire</SelectItem>
                    <SelectItem value="Battery Issues">Battery Issues</SelectItem>
                    <SelectItem value="Engine Problems">Engine Problems</SelectItem>
                    <SelectItem value="Brake Issues">Brake Issues</SelectItem>
                    <SelectItem value="Chain/Gear Problems">Chain/Gear Problems</SelectItem>
                    <SelectItem value="Electrical Issues">Electrical Issues</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.problemCategory && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.problemCategory}</p>
                )}
              </div>

              {/* Problem Description */}
              <div>
                <Label htmlFor="description" className="dark:text-gray-200">
                  Problem Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Please describe the problem in detail..."
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Be as specific as possible to help the mechanic prepare.
                </p>
                {errors.description && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Upload Images */}
              <div>
                <Label className="dark:text-gray-200">Upload Images (Optional)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white file:text-gray-700 dark:file:text-gray-300"
                  />
                  <Button type="button" variant="outline" size="icon" className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You can upload multiple images to help the mechanic understand the issue better.
                </p>
                <ImagePreview files={selectedFiles} />
                {errors.images && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.images}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="address" className="dark:text-gray-200">Your Location</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                  />
                  <Button type="button" variant="outline" onClick={getCurrentLocation} className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white whitespace-nowrap">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Location
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This is where the mechanic will come to assist you.
                </p>
                {errors.location && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Map */}
              <MapComponent id="location-map" height={300} />

              {/* Towing Service */}
              <div className="flex items-center space-x-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <Switch
                  id="requiresTowing"
                  checked={showTowing}
                  onCheckedChange={handleTowingToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
                <div className="flex-1">
                  <Label htmlFor="requiresTowing" className="dark:text-gray-200 cursor-pointer">
                    I need towing service
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Check this if your bike needs to be towed to a repair shop.
                  </p>
                </div>
              </div>

              {/* Towing Details */}
              <TowingDetails
                showTowing={showTowing}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              {/* Submit Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => window.location.href = '/user/dashboard'}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;
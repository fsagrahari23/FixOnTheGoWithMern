import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Wrench, Crown, Info, AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';
import MapPicker from '@/components/MapPicker';
import 'leaflet/dist/leaflet.css';

// Helper function to reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (e) {
    console.error('Reverse geocoding failed', e);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

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
const TowingDetails = ({ showTowing, formData, handleInputChange, handleTowingMapChange, errors }) => {
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

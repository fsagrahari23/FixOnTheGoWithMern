import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  CreditCard,
  MessageSquare,
  XCircle,
  CheckCircle,
  UserCheck,
  Calendar,
  Image as ImageIcon,
  FileText,
  DollarSign
} from 'lucide-react';

// Example booking data
const exampleBooking = {
  _id: 'BK123456789',
  createdAt: new Date().toISOString(),
  problemCategory: 'Engine Trouble',
  status: 'in-progress',
  location: {
    address: '123 Main Street, Downtown, City 12345',
    coordinates: [40.7128, -74.0060]
  },
  mechanic: {
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    rating: 4.5
  },
  description: 'My car engine is making unusual noises and losing power when accelerating. It started this morning and has been getting progressively worse.',
  images: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
  ],
  payment: {
    amount: 150.00,
    status: 'pending',
    transactionId: null
  },
  rating: null
};

const nearbyMechanicsExample = [
  { _id: 'M1', name: 'Mike Johnson', phone: '+1 (555) 234-5678', rating: 4.8 },
  { _id: 'M2', name: 'Sarah Williams', phone: '+1 (555) 345-6789', rating: 4.6 }
];

const InfoItem = ({ icon, label, value, highlight }) => {
  return (
    <div className={`flex items-center justify-between ${highlight ? 'bg-indigo-100 dark:bg-slate-600 p-3 rounded-lg' : ''}`}>
      <div className="flex items-center gap-2">
        {icon && icon}
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}:</span>
      </div>
      <span className={`text-sm font-semibold ${highlight ? 'text-indigo-800 dark:text-slate-200' : 'text-slate-800 dark:text-slate-200'}`}>{value}</span>
    </div>
  );
};

const BookingDetails = () => {
  const [booking, setBooking] = useState(exampleBooking);
  const [nearbyMechanics] = useState(nearbyMechanicsExample);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);



  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-gradient-to-r from-amber-400 to-orange-500',
        textColor: 'text-white',
        icon: '⏳'
      },
      accepted: { 
        color: 'bg-gradient-to-r from-blue-400 to-blue-600',
        textColor: 'text-white',
        icon: '✓'
      },
      'in-progress': { 
        color: 'bg-gradient-to-r from-purple-400 to-pink-500',
        textColor: 'text-white',
        icon: '🔧'
      },
      completed: { 
        color: 'bg-gradient-to-r from-emerald-400 to-green-600',
        textColor: 'text-white',
        icon: '✓'
      },
      cancelled: { 
        color: 'bg-gradient-to-r from-red-400 to-red-600',
        textColor: 'text-white',
        icon: '✗'
      }
    };
    return configs[status] || configs.pending;
  };

  const handleRatingSubmit = () => {
    console.log('Rating submitted:', { rating: selectedRating, comment });
    setBooking({
      ...booking,
      rating: {
        value: selectedRating,
        comment: comment,
        createdAt: new Date().toISOString()
      }
    });
  };

  const handleSelectMechanic = (mechanicId) => {
    console.log('Selected mechanic:', mechanicId);
  };

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      console.log('Booking cancelled');
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">



      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Booking Card */}
        <Card
          className={`overflow-hidden shadow-2xl transition-all duration-700 border-0 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } bg-white dark:bg-slate-800`}
        >
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-slate-700 dark:to-slate-600 text-white py-8 px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">Booking Details</CardTitle>
                <p className="text-blue-100 text-sm">Track and manage your service booking</p>
              </div>
              <Badge className={`${statusConfig.color} ${statusConfig.textColor} px-6 py-3 text-sm font-bold uppercase tracking-wider shadow-lg`}>
                <span className="mr-2">{statusConfig.icon}</span>
                {booking.status}
              </Badge>
            
          </CardHeader>
          
          <CardContent className="p-8 space-y-10">
            {/* Basic Info Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 shadow-md border-0 animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-slate-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-700 dark:text-blue-300">
                  <FileText className="w-5 h-5" />
                  Booking Information
                </h3>
                <div className="space-y-5">
                  <InfoItem
                    icon={<Calendar className="w-5 h-5" />}
                    label="Booking ID"
                    value={booking._id}
                  />
                  <InfoItem
                    icon={<Calendar className="w-5 h-5" />}
                    label="Date & Time"
                    value={new Date(booking.createdAt).toLocaleString()}
                  />
                  <InfoItem
                    label="Problem Category"
                    value={booking.problemCategory}
                  />
                  <div className="pt-4 border-t border-indigo-200 dark:border-slate-600">
                    <InfoItem
                      label="Current Status"
                      value={booking.status.replace('-', ' ').toUpperCase()}
                      highlight
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 shadow-md border-0 animate-fade-in delay-100 bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-slate-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <MapPin className="w-5 h-5" />
                  Location & Mechanic
                </h3>
                <div className="space-y-5">
                  <InfoItem
                    icon={<MapPin className="w-5 h-5" />}
                    label="Service Location"
                    value={booking.location.address}
                  />
                  {booking.mechanic ? (
                    <>
                      <InfoItem
                        label="Assigned Mechanic"
                        value={booking.mechanic.name}
                      />
                      <InfoItem
                        icon={<Phone className="w-5 h-5" />}
                        label="Contact Number"
                        value={booking.mechanic.phone}
                      />
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-sm text-purple-600 dark:text-slate-400">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(booking.mechanic.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          {booking.mechanic.rating.toFixed(1)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                      <p className="font-semibold text-amber-700 dark:text-amber-400">⏳ Mechanic not assigned yet</p>
                      <p className="text-sm mt-1 text-amber-600 dark:text-amber-300">We're finding the best mechanic for you</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Description */}
            <div className="animate-fade-in delay-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <FileText className="w-6 h-6" />
                Problem Description
              </h3>
              <Card className="p-6 shadow-md border-0 bg-slate-50 dark:bg-slate-700">
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  {booking.description}
                </p>
              </Card>
            </div>

            {/* Images */}
            {booking.images && booking.images.length > 0 && (
              <div className="animate-fade-in delay-300">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <ImageIcon className="w-6 h-6" />
                  Attached Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {booking.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-2xl group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg dark:shadow-slate-900/50"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={image}
                        alt={`Booking ${index + 1}`}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="font-semibold">Image {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Details */}
            {booking.status === 'completed' && booking.payment && (
              <Card className="animate-fade-in delay-400 border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-700">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-800 dark:to-teal-800 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Payment Details
                  </h3>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-slate-600 dark:text-slate-400">Total Amount:</span>
                    <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${booking.payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Payment Status:</span>
                    <Badge className={`${booking.payment.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'} text-white px-4 py-2`}>
                      {booking.payment.status}
                    </Badge>
                  </div>

                  {booking.payment.status === 'pending' && (
                    <Button className="w-full py-6 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Make Payment Now
                    </Button>
                  )}

                  {booking.payment.status === 'completed' && booking.payment.transactionId && (
                    <>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Transaction ID:</strong> {booking.payment.transactionId}
                      </div>
                      <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 border-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <AlertDescription className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Payment completed successfully!
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nearby Mechanics */}
            {booking.status === 'pending' && !booking.mechanic && nearbyMechanics.length > 0 && (
              <div className="animate-fade-in delay-500">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <UserCheck className="w-6 h-6" />
                  Available Mechanics Nearby
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {nearbyMechanics.map((mechanic, index) => (
                    <Card
                      key={mechanic._id}
                      className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-650"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-xl mb-1 text-slate-800 dark:text-slate-200">{mechanic.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Professional Mechanic</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(mechanic.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                              {mechanic.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-slate-100 dark:bg-slate-600">
                          <Phone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <p className="font-medium text-slate-700 dark:text-slate-300">{mechanic.phone}</p>
                        </div>
                        <Button
                          onClick={() => handleSelectMechanic(mechanic._id)}
                          className="w-full py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                          <UserCheck className="w-5 h-5 mr-2" />
                          Select This Mechanic
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Form */}
            {booking.status === 'completed' &&
             booking.payment &&
             booking.payment.status === 'completed' &&
             !booking.rating && (
              <Card className="animate-fade-in delay-600 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-slate-700">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-800 dark:to-orange-800 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    Rate Your Experience
                  </h3>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-4 block text-lg font-semibold text-slate-800 dark:text-slate-200">
                        How would you rate the service?
                      </Label>
                      <div className="flex gap-3 justify-center mb-6">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setSelectedRating(rating)}
                            className="transition-all duration-300 hover:scale-125"
                          >
                            <Star
                              className={`w-12 h-12 cursor-pointer transition-all duration-300 ${
                                rating <= selectedRating
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                  : 'text-gray-300 hover:text-yellow-200 dark:text-slate-600 dark:hover:text-slate-500'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        {selectedRating === 1 && "Poor"}
                        {selectedRating === 2 && "Fair"}
                        {selectedRating === 3 && "Good"}
                        {selectedRating === 4 && "Very Good"}
                        {selectedRating === 5 && "Excellent"}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="comment" className="mb-2 block font-semibold text-slate-800 dark:text-slate-200">
                        Share Your Feedback (Optional)
                      </Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience with the mechanic..."
                        rows={4}
                        className="mt-2 bg-white dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500"
                      />
                    </div>

                    <Button
                      onClick={handleRatingSubmit}
                      className="w-full py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Submit Rating
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Rating Display */}
            {booking.rating && (
              <Card className="animate-fade-in delay-600 border-0 shadow-lg bg-slate-50 dark:bg-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Star className="w-6 h-6" />
                    Your Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-6 h-6 ${
                            rating <= booking.rating.value
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(booking.rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.rating.comment ? (
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{booking.rating.comment}</p>
                  ) : (
                    <p className="italic text-slate-400 dark:text-slate-500">No comment provided</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                className="py-6 px-8 text-base font-semibold transition-all duration-300 hover:scale-105 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                {(booking.status === 'pending' || booking.status === 'accepted') && (
                  <Button
                    onClick={handleCancelBooking}
                    className="py-6 px-8 text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Cancel Booking
                  </Button>
                )}

                {booking.mechanic && (
                  <Button className="py-6 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat with Mechanic
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Map */}
        {booking.status === 'in-progress' && booking.mechanic && (
          <Card className="animate-fade-in delay-700 shadow-2xl border-0 bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 dark:bg-slate-700 text-white py-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="rounded-2xl h-80 flex items-center justify-center mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:bg-slate-700">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-purple-400 dark:text-slate-500" />
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Interactive Map</p>
                  <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Real-time location tracking with Leaflet.js</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
              
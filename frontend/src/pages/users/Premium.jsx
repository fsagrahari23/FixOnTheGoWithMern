import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Crown,
  Check,
  X,
  Zap,
  MapPin,
  Percent,
  Ambulance,
  Truck,
  Wrench,
  Star,
  Info,
  Loader2,
  Calendar,
  Shield
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '@/lib/api';
import { processPayment } from '@/store/slices/bookingThunks';

const Premium = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscription, loading, error } = useSelector((state) => state.booking);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Fetch subscription data
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const data = await apiGet('/user/api/premium');
      setSubscriptionData(data.subscription);
    } catch (error) {
      console.error('Error fetching premium data:', error);
    }
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate card details
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.name) {
      alert('Please fill in all payment details');
      return;
    }

    if (paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
      alert('Please enter expiry date in MM/YY format');
      return;
    }

    if (paymentDetails.cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return;
    }

    setProcessing(true);

    try {
      const amount = selectedPlan === 'monthly' ? 9.99 : 99.99;
      
      // Process payment for subscription
      const response = await apiPost('/payment/premium/process', {
        plan: selectedPlan,
        amount,
        paymentDetails: {
          ...paymentDetails,
          cardNumber: paymentDetails.cardNumber.replace(/\s/g, '')
        }
      });

      if (response.success) {
        alert(`Successfully subscribed to ${selectedPlan} premium plan!`);
        setShowPaymentModal(false);
        setPaymentDetails({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
        // Refresh subscription data
        await fetchSubscriptionData();
      } else {
        alert(response.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await apiPost('/user/premium/cancel');
      fetchSubscriptionData(); // Refresh data
    } catch (error) {
      console.error('Error cancelling:', error);
    }
  };

  const isSubscribed = subscriptionData && subscriptionData.status === 'active' && new Date(subscriptionData.expiresAt) > new Date();
  const currentPlan = subscriptionData?.plan;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            Premium Membership
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Unlock exclusive features and benefits</p>
        </div>

        {/* Current Subscription Alert */}
        {isSubscribed && (
          <Alert className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>You are currently on the {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1)} Premium Plan.</strong><br />
              Your membership expires on {new Date(subscriptionData.expiresAt).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <Card className="shadow-lg">
            <CardHeader className="text-center py-6 bg-slate-50 dark:bg-slate-700">
              <CardTitle className="text-2xl">Basic</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">For casual users</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-1">Free</h2>
                <p className="text-slate-600 dark:text-slate-400">Forever</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Book mechanics for repairs</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Chat with assigned mechanic</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Standard booking experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm">Priority service</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm">Mechanic tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm">Emergency assistance</span>
                </li>
              </ul>

              <div className="mt-auto">
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Premium Plan */}
          <Card className="shadow-lg border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
            </div>
            <CardHeader className="text-center py-6 bg-blue-500 text-white">
              <CardTitle className="text-2xl">Monthly Premium</CardTitle>
              <p className="opacity-90">For regular riders</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-1">$9.99</h2>
                <p className="text-slate-600 dark:text-slate-400">per month</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">All Basic features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">Priority service</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">Real-time mechanic tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">10% discount on services</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Cancel anytime</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm">Emergency roadside assistance</span>
                </li>
              </ul>

              <div className="mt-auto">
                {currentPlan === 'monthly' && isSubscribed ? (
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Subscribe Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Yearly Premium Plan */}
          <Card className="shadow-lg">
            <CardHeader className="text-center py-6 bg-slate-800 text-white">
              <CardTitle className="text-2xl">Yearly Premium</CardTitle>
              <p className="opacity-90">Best value</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-1">$99.99</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  per year <Badge variant="destructive" className="ml-2">Save 17%</Badge>
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">All Monthly Premium features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">15% discount on services</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">Emergency roadside assistance</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">Free towing service (2x/year)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold">Quarterly bike maintenance check</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Priority customer support</span>
                </li>
              </ul>

              <div className="mt-auto">
                {currentPlan === 'yearly' && isSubscribed ? (
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-slate-800 hover:bg-slate-900"
                    onClick={() => handleSubscribe('yearly')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Subscribe Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Premium Benefits in Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Priority Service</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Your booking requests will be prioritized over non-premium users, ensuring faster service.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Real-time Mechanic Tracking</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Track your mechanic's location in real-time and get accurate ETA updates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Service Discounts</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Get exclusive discounts on all services, helping you save money on repairs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ambulance className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Emergency Roadside Assistance</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Get 24/7 emergency assistance for breakdowns and other roadside emergencies.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Free Towing Service</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Yearly plan includes free towing services twice per year for situations where on-site repair isn't possible.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Maintenance Checks</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Yearly premium members receive quarterly bike maintenance checks to prevent breakdowns.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-500" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h6 className="font-semibold mb-2">Can I cancel my subscription anytime?</h6>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Yes, you can cancel your subscription at any time. Your premium benefits will remain active until the end of your current billing period.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h6 className="font-semibold mb-2">How do I access emergency roadside assistance?</h6>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  For emergency assistance, you can use the "Emergency" button in the app which is available to premium members. Our support team will coordinate assistance for you 24/7.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h6 className="font-semibold mb-2">How is the service discount applied?</h6>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  The discount is automatically applied to your bill when the mechanic completes the service. Monthly members receive 10% off, while yearly members enjoy 15% off all services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Subscribe to {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Premium
              </DialogTitle>
              <DialogDescription>
                Complete your payment to activate premium features
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                  <span className="font-semibold">{selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Premium</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                  <span className="font-bold text-lg">${selectedPlan === 'monthly' ? '9.99' : '99.99'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={paymentDetails.name}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                    disabled={processing}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
                    }}
                    maxLength={19}
                    disabled={processing}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setPaymentDetails({ ...paymentDetails, expiryDate: value });
                      }}
                      maxLength={5}
                      disabled={processing}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={paymentDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentDetails({ ...paymentDetails, cvv: value });
                      }}
                      maxLength={3}
                      disabled={processing}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${selectedPlan === 'monthly' ? '9.99' : '99.99'}`
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Premium;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetCartQuery,
  useCreateCheckoutSessionMutation,
  useUpdateCheckoutSessionMutation,
  useCompleteCheckoutMutation,
} from '@/store/api';
import { useGetProfileQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/common/components/ui/radio-group';
import { Separator } from '@/common/components/ui/separator';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Switch } from '@/common/components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { CheckCircle2, ChevronRight, ShoppingBag, MapPin, CreditCard, Gift } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Shipping', 'Payment', 'Review'] as const;
type Step = (typeof STEPS)[number];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
  const { data: profileData } = useGetProfileQuery();
  const [createSession] = useCreateCheckoutSessionMutation();
  const [_updateSession] = useUpdateCheckoutSessionMutation();
  const [completeCheckout, { isLoading: completing }] = useCompleteCheckoutMutation();

  const [currentStep, setCurrentStep] = useState<Step>('Shipping');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Form state
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const user = profileData?.data;

  // Pre-fill name from profile
  if (user && !shippingForm.fullName) {
    setShippingForm((prev) => ({
      ...prev,
      fullName: user.name ?? '',
      phone: user.phone ?? '',
    }));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAddition * item.quantity,
    0,
  );

  const stepIndex = STEPS.indexOf(currentStep);

  const handleShippingNext = async () => {
    if (!shippingForm.fullName || !shippingForm.phone || !shippingForm.streetAddress || !shippingForm.city) {
      toast.error('Please fill in all required shipping fields');
      return;
    }

    setCurrentStep('Payment');
  };

  const handlePaymentNext = async () => {
    setCurrentStep('Review');
  };

  const handlePlaceOrder = async () => {
    try {
      let checkoutSessionId = sessionId;
      if (!checkoutSessionId && cart) {
        const res = await createSession({}).unwrap();
        checkoutSessionId = res.data.id;
        setSessionId(checkoutSessionId);
      }
      if (!checkoutSessionId) {
        toast.error('Checkout session not found');
        return;
      }
      await completeCheckout(checkoutSessionId).unwrap();
      toast.success('Order placed successfully!');
      navigate('/account/orders');
    } catch {
      toast.error('Failed to place order');
    }
  };

  if (cartLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Checkout" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 text-center py-12">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some products before checking out.</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Checkout" />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                i < stepIndex
                  ? 'bg-green-100 text-green-700'
                  : i === stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < stepIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="w-4 text-center">{i + 1}</span>
              )}
              {step}
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {currentStep === 'Shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={shippingForm.fullName}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone *</Label>
                    <Input
                      value={shippingForm.phone}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Street Address *</Label>
                  <Input
                    value={shippingForm.streetAddress}
                    onChange={(e) =>
                      setShippingForm((p) => ({ ...p, streetAddress: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>City *</Label>
                    <Input
                      value={shippingForm.city}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Province</Label>
                    <Input
                      value={shippingForm.province}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, province: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={shippingForm.postalCode}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, postalCode: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Switch checked={isGift} onCheckedChange={setIsGift} />
                  <Label className="flex items-center gap-2">
                    <Gift className="h-4 w-4" /> This is a gift
                  </Label>
                </div>
                {isGift && (
                  <div className="grid gap-2">
                    <Label>Gift Message</Label>
                    <Textarea
                      placeholder="Write a message for the recipient..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Order Notes (optional)</Label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

                <Button onClick={handleShippingNext} className="w-full">
                  Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'Payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="bank_transfer" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep('Shipping')}>
                    Back
                  </Button>
                  <Button onClick={handlePaymentNext} className="flex-1">
                    Continue to Review <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Step */}
          {currentStep === 'Review' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping summary */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Shipping
                    </p>
                    <Button variant="link" size="sm" onClick={() => setCurrentStep('Shipping')}>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm">{shippingForm.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingForm.streetAddress}, {shippingForm.city} {shippingForm.province}
                  </p>
                </div>

                {/* Payment summary */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Payment
                    </p>
                    <Button variant="link" size="sm" onClick={() => setCurrentStep('Payment')}>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm capitalize">{paymentMethod.replace('_', ' ')}</p>
                </div>

                {/* Items */}
                <div className="rounded-lg border p-4">
                  <p className="font-medium mb-3">
                    Items ({items.length})
                  </p>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          {item.product?.name?.slice(0, 2)?.toUpperCase() ?? 'PR'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product?.name ?? 'Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <PriceDisplay price={item.priceAtAddition * item.quantity} />
                      </div>
                    ))}
                  </div>
                </div>

                {customerNotes && (
                  <div className="rounded-lg border p-4">
                    <p className="font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{customerNotes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep('Payment')}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={completing}
                    className="flex-1"
                    size="lg"
                  >
                    {completing ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})
              </span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

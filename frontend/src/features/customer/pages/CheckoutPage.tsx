import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetCartQuery,
  useCreateCheckoutSessionMutation,
  useUpdateCheckoutSessionMutation,
  useCompleteCheckoutMutation,
  useCreateOrderMutation,
  useCreatePaymentMutation,
  useCreateStripeIntentMutation,
  useApplyCartVoucherMutation,
  useRemoveCartVoucherMutation,
} from '@/store/api';
import { useGetProfileQuery } from '@/store/api';
import { useGetMyLoyaltyPointsQuery, useRedeemPointsMutation } from '@/store/api';
import { PaymentMethod as PaymentMethodEnum } from '@/common/types/enums';
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
import {
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Gift,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Tag,
  Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { shippingSchema } from '@/common/schemas/checkout.schema';

// ── Stripe imports ──────────────────────────────────────────────────
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/config/stripe';
import type { StripeCardElementOptions } from '@stripe/stripe-js';

// ── Constants ───────────────────────────────────────────────────────
const STEPS = ['Shipping', 'Payment', 'Review'] as const;
type Step = (typeof STEPS)[number];

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'hsl(var(--foreground))',
      '::placeholder': { color: 'hsl(var(--muted-foreground))' },
    },
    invalid: { color: '#df1b41' },
  },
  hidePostalCode: true,
};

// ── Stripe Card Form (must be inside <Elements>) ────────────────────
interface StripeCardFormProps {
  onPaymentMethodCreated: (pmId: string, brand: string, last4: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

function StripeCardForm({ onPaymentMethodCreated, onBack, isProcessing }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setCreating(true);
    setError(null);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Failed to process card');
      setCreating(false);
      return;
    }

    if (paymentMethod) {
      onPaymentMethodCreated(
        paymentMethod.id,
        paymentMethod.card?.brand ?? 'card',
        paymentMethod.card?.last4 ?? '****',
      );
    }
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <Label className="mb-3 block text-sm font-medium">Card Details</Label>
        <div className="rounded-md border bg-background p-3">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              setError(e.error?.message ?? null);
            }}
          />
        </div>
        {error && (
          <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Your card info is encrypted and sent directly to Stripe. We never store it.
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={creating || isProcessing}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!stripe || !cardComplete || creating || isProcessing}
          className="flex-1 bg-brand-500 text-navy hover:bg-brand-600"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>Continue to Review <ChevronRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Checkout Page ──────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
  const { data: profileData } = useGetProfileQuery();
  const [createSession] = useCreateCheckoutSessionMutation();
  const [updateSession] = useUpdateCheckoutSessionMutation();
  const [completeCheckout] = useCompleteCheckoutMutation();
  const [createOrder] = useCreateOrderMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [createStripeIntent] = useCreateStripeIntentMutation();
  const [applyVoucher] = useApplyCartVoucherMutation();
  const [removeVoucher] = useRemoveCartVoucherMutation();
  const { data: loyaltyData } = useGetMyLoyaltyPointsQuery();
  const [redeemPoints] = useRedeemPointsMutation();

  const [currentStep, setCurrentStep] = useState<Step>('Shipping');
  const [placing, setPlacing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank_transfer'>('cod');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Stripe state — populated when user enters card in Payment step
  const [stripePmId, setStripePmId] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Loyalty points state
  const [usePoints, setUsePoints] = useState(false);

  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const user = profileData?.data;

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAddition * item.quantity,
    0,
  );

  const availablePoints = loyaltyData?.data?.availableBalance ?? 0;
  const pointsValue = Math.min(availablePoints, Math.floor(subtotal * 100)) / 100; // 1 point = 0.01 currency
  const loyaltyDiscount = usePoints ? pointsValue : 0;
  const finalTotal = Math.max(0, subtotal - voucherDiscount - loyaltyDiscount);

  // Pre-fill name from profile
  useEffect(() => {
    if (user && !shippingForm.fullName && user.name) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: user.name ?? '',
        phone: user.phone ?? '',
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const stepIndex = STEPS.indexOf(currentStep);

  // ── Voucher handlers ──────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    try {
      const res = await applyVoucher({ code: voucherCode.trim() }).unwrap();
      setAppliedVoucher(voucherCode.trim());
      setVoucherDiscount(res.data?.discount ?? 0);
      toast.success('Voucher applied!');
    } catch {
      toast.error('Invalid or expired voucher code');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    try {
      await removeVoucher().unwrap();
    } catch { /* ignore */ }
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode('');
  };

  // ── Step handlers ─────────────────────────────────────────────────
  const handleShippingNext = () => {
    const result = shippingSchema.safeParse(shippingForm);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    setCurrentStep('Payment');
  };

  const handlePaymentNext = () => {
    // For non-card methods, go straight to review
    if (paymentMethod !== 'card') {
      setStripePmId(null);
      setCardInfo(null);
      setCurrentStep('Review');
    }
    // For card: StripeCardForm handles the transition via onPaymentMethodCreated
  };

  const handleStripeCardReady = useCallback(
    (pmId: string, brand: string, last4: string) => {
      setStripePmId(pmId);
      setCardInfo({ brand, last4 });
      setCurrentStep('Review');
    },
    [],
  );

  // ── Place Order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!user || !cart) return;
    setPlacing(true);
    setStripeError(null);

    try {
      // 1. Create & complete checkout session (preserves existing backend flow)
      const sessionRes = await createSession({}).unwrap();
      const sessionId = sessionRes.data.id;
      await updateSession({
        id: sessionId,
        data: {
          paymentMethod: paymentMethod === 'card' ? 'stripe' : paymentMethod,
          giftMessage: isGift ? giftMessage : undefined,
        },
      }).unwrap();
      await completeCheckout(sessionId).unwrap();

      // 2. Create the order
      const storeId =
        items[0]?.product?.sellerId ?? '00000000-0000-0000-0000-000000000000';
      const orderRes = await createOrder({
        userId: user.id,
        storeId,
        subtotal,
        totalAmount: finalTotal,
        shippingAddress: { ...shippingForm },
        paymentMethod: paymentMethod === 'card' ? 'stripe' : paymentMethod,
        customerNotes: customerNotes || undefined,
        isGift,
        giftMessage: isGift ? giftMessage : undefined,
      }).unwrap();
      const orderId = orderRes.data.id;

      // 2b. Redeem loyalty points if used
      if (usePoints && loyaltyDiscount > 0) {
        redeemPoints({ points: Math.round(loyaltyDiscount * 100), orderId }).catch(() => {});
      }

      // 3. If COD or bank transfer → done
      if (paymentMethod !== 'card') {
        toast.success('Order placed successfully!');
        navigate('/account/orders');
        return;
      }

      // 4. Stripe card flow
      if (!stripePmId) {
        toast.error('Card information is missing. Please go back and re-enter your card.');
        setPlacing(false);
        return;
      }

      // 4a. Create payment record
      const paymentRes = await createPayment({
        orderId,
        userId: user.id,
        amount: finalTotal,
        paymentMethod: PaymentMethodEnum.STRIPE,
        gatewayName: 'stripe',
        stripePaymentMethodId: stripePmId,
      }).unwrap();
      const paymentId = paymentRes.data.id;

      // 4b. Create Stripe PaymentIntent
      const intentRes = await createStripeIntent({
        paymentId,
        stripePaymentMethodId: stripePmId,
      }).unwrap();
      const { clientSecret, status } = intentRes.data;

      // 4c. If intent already succeeded (e.g. no 3DS needed)
      if (status === 'succeeded') {
        toast.success('Payment successful! Order placed.');
        navigate('/account/orders');
        return;
      }

      // 4d. Confirm on client (handles 3D Secure automatically)
      if (clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe.js failed to load');
        }

        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: stripePmId,
        });

        if (confirmError) {
          setStripeError(confirmError.message ?? 'Payment failed');
          toast.error(confirmError.message ?? 'Payment failed');
          setPlacing(false);
          return;
        }
      }

      toast.success('Payment successful! Order placed.');
      navigate('/account/orders');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to place order')
          : 'Failed to place order';
      toast.error(message);
      setPlacing(false);
    }
  };

  // ── Loading / Empty states ────────────────────────────────────────
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
        <Button onClick={() => navigate('/products')} className="bg-brand-500 text-navy hover:bg-brand-600">
          Browse Products
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader title="Checkout" />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                i < stepIndex
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : i === stepIndex
                    ? 'bg-brand-500 text-navy'
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
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* ── Shipping Step ──────────────────────────────────────── */}
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

                <Button
                  onClick={handleShippingNext}
                  className="w-full bg-brand-500 text-navy hover:bg-brand-600"
                >
                  Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Payment Step ───────────────────────────────────────── */}
          {currentStep === 'Payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as 'cod' | 'card' | 'bank_transfer')
                  }
                >
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                        : ''
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">
                        Pay securely with Stripe
                      </p>
                    </Label>
                    <div className="flex gap-1">
                      <span className="rounded bg-[#1a1f71] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        VISA
                      </span>
                      <span className="rounded bg-[#eb001b] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        MC
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                        : ''
                    }`}
                  >
                    <RadioGroupItem value="bank_transfer" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        Direct bank transfer
                      </p>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Stripe card input — shown when card is selected */}
                {paymentMethod === 'card' ? (
                  stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <StripeCardForm
                        onPaymentMethodCreated={handleStripeCardReady}
                        onBack={() => setCurrentStep('Shipping')}
                        isProcessing={placing}
                      />
                    </Elements>
                  ) : (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                      Stripe is not configured. Please set{' '}
                      <code className="font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
                      in your environment.
                    </div>
                  )
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep('Shipping')}>
                      Back
                    </Button>
                    <Button
                      onClick={handlePaymentNext}
                      className="flex-1 bg-brand-500 text-navy hover:bg-brand-600"
                    >
                      Continue to Review <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Review Step ────────────────────────────────────────── */}
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
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setCurrentStep('Shipping')}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm">{shippingForm.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingForm.streetAddress}, {shippingForm.city}{' '}
                    {shippingForm.province}
                  </p>
                </div>

                {/* Payment summary */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Payment
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setStripePmId(null);
                        setCardInfo(null);
                        setCurrentStep('Payment');
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  {paymentMethod === 'card' && cardInfo ? (
                    <p className="text-sm">
                      <span className="font-medium capitalize">{cardInfo.brand}</span>{' '}
                      •••• {cardInfo.last4}
                    </p>
                  ) : (
                    <p className="text-sm capitalize">
                      {paymentMethod.replace('_', ' ')}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="rounded-lg border p-4">
                  <p className="font-medium mb-3">Items ({items.length})</p>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            {item.product?.name?.slice(0, 2)?.toUpperCase() ?? 'PR'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product?.name ?? 'Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
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

                {/* Stripe error */}
                {stripeError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {stripeError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('Payment')}
                    disabled={placing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 bg-brand-500 text-navy hover:bg-brand-600"
                    size="lg"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {paymentMethod === 'card'
                          ? 'Processing Payment...'
                          : 'Placing Order...'}
                      </>
                    ) : paymentMethod === 'card' ? (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Pay {formatCurrency(finalTotal)} &amp; Place Order
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Order Summary Sidebar ──────────────────────────────── */}
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
              <span className="text-green-600 font-medium">Free</span>
            </div>

            {/* Voucher Code Input */}
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="h-3.5 w-3.5" /> Voucher Code
              </Label>
              {appliedVoucher ? (
                <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedVoucher}</span>
                  <Button variant="ghost" size="sm" onClick={handleRemoveVoucher} className="h-6 text-xs">Remove</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApplyVoucher}
                    disabled={applyingVoucher || !voucherCode.trim()}
                    className="h-8 text-xs"
                  >
                    {applyingVoucher ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Voucher Discount</span>
                <span>-{formatCurrency(voucherDiscount)}</span>
              </div>
            )}

            {/* Loyalty Points */}
            {availablePoints > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Coins className="h-3.5 w-3.5" /> Use Loyalty Points
                    </Label>
                    <Switch checked={usePoints} onCheckedChange={setUsePoints} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {availablePoints.toLocaleString()} points available (worth {formatCurrency(pointsValue)})
                  </p>
                  {usePoints && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Points Discount</span>
                      <span>-{formatCurrency(loyaltyDiscount)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(finalTotal)}</span>
            </div>
            {paymentMethod === 'card' && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                Secure payment powered by Stripe
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

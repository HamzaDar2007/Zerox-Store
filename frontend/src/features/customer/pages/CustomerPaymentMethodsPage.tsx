import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent } from '@/common/components/ui/card';
import { Label } from '@/common/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/common/components/ui/dialog';
import {
  CreditCard,
  Star,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import type { SavedPaymentMethod } from '@/common/types';
import {
  useGetSavedPaymentMethodsQuery,
  useDeleteSavedPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useSaveStripePaymentMethodMutation,
} from '@/store/api';
import { toast } from 'sonner';

// ── Stripe ──────────────────────────────────────────────────────────
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/config/stripe';
import type { StripeCardElementOptions } from '@stripe/stripe-js';

const CARD_OPTIONS: StripeCardElementOptions = {
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

// Card brand → display color
const BRAND_COLORS: Record<string, string> = {
  visa: 'bg-[#1a1f71] text-white',
  mastercard: 'bg-[#eb001b] text-white',
  amex: 'bg-[#006fcf] text-white',
  discover: 'bg-[#ff6000] text-white',
};

// ── Add Card Form (inside <Elements>) ───────────────────────────────
function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saveStripe] = useSaveStripePaymentMethodMutation();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSave = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSaving(true);
    setError(null);

    // 1. Create a Stripe PaymentMethod from the card
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Failed to process card');
      setSaving(false);
      return;
    }

    if (!paymentMethod) {
      setError('No payment method returned');
      setSaving(false);
      return;
    }

    try {
      // 2. Save to backend via POST /payment-methods/stripe/save
      // Note: stripeCustomerId should come from the backend in a production setup.
      // For now we pass the PM id; the backend creates/retrieves the customer.
      await saveStripe({
        stripePaymentMethodId: paymentMethod.id,
        stripeCustomerId: '', // Backend should handle customer creation
        setDefault: true,
      }).unwrap();

      toast.success('Card saved successfully');
      onSuccess();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to save card')
          : 'Failed to save card';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <Label className="mb-3 block text-sm font-medium">Card Details</Label>
        <div className="rounded-md border bg-background p-3">
          <CardElement
            options={CARD_OPTIONS}
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
          Your card is encrypted and stored securely by Stripe.
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!stripe || !cardComplete || saving}
          className="bg-brand-500 text-navy hover:bg-brand-600"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Card'
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function CustomerPaymentMethodsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data, isLoading } = useGetSavedPaymentMethodsQuery();
  const methods = (data?.data ?? []) as SavedPaymentMethod[];

  const [deleteMethod] = useDeleteSavedPaymentMethodMutation();
  const [setDefault] = useSetDefaultPaymentMethodMutation();

  if (isLoading) return <LoadingSpinner label="Loading payment methods..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Manage your saved payment methods"
      >
        {stripePromise && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-brand-500 text-navy hover:bg-brand-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Card
          </Button>
        )}
      </PageHeader>

      {methods.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-10 w-10" />}
          title="No payment methods"
          description="Save a card for faster checkout."
          action={
            stripePromise
              ? { label: 'Add Your First Card', onClick: () => setAddDialogOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <Card
              key={m.id}
              className={m.isDefault ? 'border-brand-500 shadow-sm' : ''}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    BRAND_COLORS[m.cardBrand?.toLowerCase() ?? ''] ??
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  {m.cardBrand
                    ?.slice(0, 4)
                    .toUpperCase() ?? (
                    <CreditCard className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">
                      {m.cardBrand || m.paymentMethod || 'Card'}
                    </p>
                    {m.isDefault && (
                      <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                        Default
                      </Badge>
                    )}
                  </div>
                  {m.cardLastFour && (
                    <p className="text-sm text-muted-foreground">
                      •••• {m.cardLastFour}
                      {m.cardExpiryMonth && m.cardExpiryYear && (
                        <>
                          {' '}
                          · Exp{' '}
                          {String(m.cardExpiryMonth).padStart(2, '0')}/
                          {m.cardExpiryYear}
                        </>
                      )}
                    </p>
                  )}
                  {m.nickname && (
                    <p className="text-sm text-muted-foreground">{m.nickname}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {!m.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefault(m.id)}
                      >
                        <Star className="mr-1 h-3 w-3" /> Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(m.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Add Payment Card
            </DialogTitle>
            <DialogDescription>
              Enter your card details. Your information is encrypted by Stripe.
            </DialogDescription>
          </DialogHeader>
          {stripePromise && (
            <Elements stripe={stripePromise}>
              <AddCardForm
                onSuccess={() => setAddDialogOpen(false)}
                onCancel={() => setAddDialogOpen(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Payment Method"
        description="Are you sure you want to remove this payment method? This cannot be undone."
        onConfirm={async () => {
          if (deleteId) {
            await deleteMethod(deleteId);
            toast.success('Payment method removed');
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}

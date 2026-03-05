import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, stripeAppearance } from '@/config/stripe';
import type { StripeElementsOptions } from '@stripe/stripe-js';

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

/**
 * Wraps children with the Stripe `<Elements>` provider.
 * Only render this when you have a valid `clientSecret`
 * (from a PaymentIntent or SetupIntent).
 */
export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Stripe is not configured. Please set{' '}
        <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> in your
        environment.
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

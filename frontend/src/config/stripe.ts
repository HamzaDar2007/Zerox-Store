import { loadStripe } from '@stripe/stripe-js';
import type { Appearance } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn(
    '[Stripe] Missing VITE_STRIPE_PUBLISHABLE_KEY — card payments will not work.',
  );
}

/**
 * Singleton Stripe.js promise — loaded once, reused everywhere.
 * Returns `null` if the key is not configured.
 */
export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

/**
 * Amazon-inspired Stripe Elements appearance that
 * respects light / dark mode via CSS custom properties.
 */
export const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#FF9900',
    colorBackground: 'hsl(var(--card))',
    colorText: 'hsl(var(--foreground))',
    colorDanger: '#df1b41',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid hsl(var(--border))',
      boxShadow: 'none',
      padding: '10px 12px',
    },
    '.Input:focus': {
      border: '1px solid #FF9900',
      boxShadow: '0 0 0 1px #FF9900',
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '14px',
      marginBottom: '6px',
    },
  },
};

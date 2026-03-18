export function redirectToStripePaymentLink() {
  const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

  if (!paymentLink) {
    throw new Error('Missing VITE_STRIPE_PAYMENT_LINK in environment variables.');
  }

  window.location.assign(paymentLink);
}

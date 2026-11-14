import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY en .env.local — conseguila en https://dashboard.stripe.com/test/apikeys",
    );
  }
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

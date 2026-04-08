import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth0 } from '../../../../lib/auth0';
import { markRecordAsPaidByEmail } from '../../../../lib/pocketbase-admin';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const POCKETBASE_COLLECTION = process.env.POCKETBASE_COLLECTION || 'feedback';
const EXPECTED_PAYMENT_URL = 'https://buy.stripe.com/test_8x24gz5aU1pBdCvbsA0co00';

function createStripeClient() {
    if (!STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required');
    }

    return new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-03-31.basil',
    });
}

function getEmailFromPaymentIntent(paymentIntent) {
    const metadataEmail =
        paymentIntent.metadata?.email ||
        paymentIntent.metadata?.customer_email ||
        paymentIntent.metadata?.auth0_email;

    if (metadataEmail) {
        return metadataEmail;
    }

    const chargeEmail = paymentIntent.latest_charge?.billing_details?.email;
    if (chargeEmail) {
        return chargeEmail;
    }

    const firstChargeEmail = paymentIntent.charges?.data?.[0]?.billing_details?.email;
    if (firstChargeEmail) {
        return firstChargeEmail;
    }

    return paymentIntent.receipt_email || null;
}

function isExpectedPaymentUrl(metadata) {
    const urlFromMetadata =
        metadata?.payment_url ||
        metadata?.checkout_url ||
        metadata?.stripe_payment_link;

    if (!urlFromMetadata) {
        return true;
    }

    return urlFromMetadata === EXPECTED_PAYMENT_URL;
}

async function resolvePaymentIntentFromEvent(event, stripe) {
    // Primary happy path: Stripe sends payment_intent.succeeded directly.
    if (event.type === 'payment_intent.succeeded') {
        return event.data.object;
    }

    // Fallback: checkout.session.completed can contain only payment_intent id.
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (!session.payment_intent) {
            return null;
        }

        if (typeof session.payment_intent === 'string') {
            return stripe.paymentIntents.retrieve(session.payment_intent, {
                expand: ['latest_charge'],
            });
        }

        return session.payment_intent;
    }

    return null;
}

export async function POST(request) {
    try {
        // Task requirement: update PocketBase only for authenticated users.
        const session = await auth0.getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ received: true, ignored: 'unauthorized' }, { status: 200 });
        }

        if (!STRIPE_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
        }

        const stripe = createStripeClient();
        const stripeSignature = (await headers()).get('stripe-signature');

        if (!stripeSignature) {
            return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
        }

        const rawBody = await request.text();
        const event = stripe.webhooks.constructEvent(rawBody, stripeSignature, STRIPE_WEBHOOK_SECRET);

        const paymentIntent = await resolvePaymentIntentFromEvent(event, stripe);
        if (!paymentIntent) {
            // Return 200 for unrelated events so Stripe does not retry.
            return NextResponse.json({ received: true }, { status: 200 });
        }

        if (paymentIntent.status !== 'succeeded') {
            // We only process successful payments.
            return NextResponse.json({ received: true }, { status: 200 });
        }

        if (!isExpectedPaymentUrl(paymentIntent.metadata)) {
            return NextResponse.json({ error: 'Unexpected payment URL' }, { status: 400 });
        }

        const emailFromStripe = getEmailFromPaymentIntent(paymentIntent);
        const email = emailFromStripe || session.user.email;

        if (!email) {
            return NextResponse.json({ error: 'Unable to resolve email' }, { status: 400 });
        }

        if (email.toLowerCase() !== session.user.email.toLowerCase()) {
            return NextResponse.json({ received: true, ignored: 'email_mismatch' }, { status: 200 });
        }

        const result = await markRecordAsPaidByEmail({
            collectionName: POCKETBASE_COLLECTION,
            email,
            paymentIntentId: paymentIntent.id,
        });

        return NextResponse.json(
            {
                received: true,
                paymentIntentId: paymentIntent.id,
                pocketbaseAction: result.action,
                pocketbaseRecordId: result.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Stripe webhook error:', error);

        if (error?.type === 'StripeSignatureVerificationError') {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

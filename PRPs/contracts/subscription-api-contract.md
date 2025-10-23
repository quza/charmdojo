# Subscription API Contract

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Base URL:** `/api/subscription`

---

## Overview

Stripe subscription management endpoints for handling premium subscriptions, checkout, and webhooks.

---

## Endpoints

### 1. Create Checkout Session

**Endpoint:** `POST /api/subscription/create-checkout`  
**Purpose:** Create Stripe Checkout session for premium subscription purchase  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface CreateCheckoutRequest {
  priceId: string;       // Stripe Price ID (monthly or yearly), required
  successUrl?: string;   // Optional, default: '/success'
  cancelUrl?: string;    // Optional, default: '/pricing'
}
```

**Validation Rules:**
- `priceId`: Required, must match configured Stripe price IDs
- `successUrl`: Optional, valid relative or absolute URL
- `cancelUrl`: Optional, valid relative or absolute URL

**Example Request:**
```json
{
  "priceId": "price_1234567890abcdef",
  "successUrl": "/dashboard?checkout=success",
  "cancelUrl": "/pricing?checkout=cancelled"
}
```

#### Response (200 OK)

```typescript
interface CreateCheckoutResponse {
  checkoutUrl: string;    // Stripe Checkout session URL
  sessionId: string;      // Stripe session ID for tracking
}
```

**Example Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0",
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

#### Error Responses

**400 Bad Request - Invalid Price ID**
```json
{
  "error": "invalid_price_id",
  "message": "The provided price ID is not valid",
  "validPriceIds": [
    "price_monthly_premium",
    "price_yearly_premium"
  ],
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**409 Conflict - Already Subscribed**
```json
{
  "error": "already_subscribed",
  "message": "You already have an active premium subscription",
  "subscription": {
    "status": "active",
    "planType": "monthly",
    "currentPeriodEnd": "2025-11-23T10:30:00Z"
  },
  "manageUrl": "/settings/subscription",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**500 Internal Server Error - Stripe Error**
```json
{
  "error": "stripe_error",
  "message": "Failed to create checkout session",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 2. Get Subscription Status

**Endpoint:** `GET /api/subscription/status`  
**Purpose:** Retrieve user's current subscription status  
**Authentication:** Required (Bearer token)

#### Request

No parameters required.

#### Response (200 OK)

```typescript
interface SubscriptionStatusResponse {
  hasSubscription: boolean;
  subscription: {
    id: string | null;                    // Subscription UUID
    status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | null;
    planType: 'monthly' | 'yearly' | null;
    currentPeriodStart: string | null;    // ISO 8601
    currentPeriodEnd: string | null;      // ISO 8601
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };
  billing: {
    nextBillingDate: string | null;       // ISO 8601
    amount: number | null;                // Cents
    currency: string;                     // 'usd'
  };
}
```

**Example Response (Active Premium):**
```json
{
  "hasSubscription": true,
  "subscription": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "planType": "monthly",
    "currentPeriodStart": "2025-10-23T10:30:00Z",
    "currentPeriodEnd": "2025-11-23T10:30:00Z",
    "cancelAtPeriodEnd": false,
    "stripeCustomerId": "cus_1234567890abcdef",
    "stripeSubscriptionId": "sub_1234567890abcdef"
  },
  "billing": {
    "nextBillingDate": "2025-11-23T10:30:00Z",
    "amount": 1999,
    "currency": "usd"
  }
}
```

**Example Response (Free Tier):**
```json
{
  "hasSubscription": false,
  "subscription": {
    "id": null,
    "status": null,
    "planType": null,
    "currentPeriodStart": null,
    "currentPeriodEnd": null,
    "cancelAtPeriodEnd": false,
    "stripeCustomerId": null,
    "stripeSubscriptionId": null
  },
  "billing": {
    "nextBillingDate": null,
    "amount": null,
    "currency": "usd"
  }
}
```

---

### 3. Create Customer Portal Session

**Endpoint:** `POST /api/subscription/create-portal`  
**Purpose:** Create Stripe Customer Portal session for subscription management  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface CreatePortalRequest {
  returnUrl?: string;  // Optional, default: '/settings/subscription'
}
```

**Example Request:**
```json
{
  "returnUrl": "/settings/subscription"
}
```

#### Response (200 OK)

```typescript
interface CreatePortalResponse {
  portalUrl: string;  // Stripe Customer Portal URL
}
```

**Example Response:**
```json
{
  "portalUrl": "https://billing.stripe.com/p/session/test_YWNjdF8xMjM0NTY3ODkw"
}
```

#### Error Responses

**404 Not Found - No Subscription**
```json
{
  "error": "no_subscription",
  "message": "You don't have an active subscription to manage",
  "upgradeUrl": "/pricing",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**500 Internal Server Error - Stripe Error**
```json
{
  "error": "stripe_error",
  "message": "Failed to create portal session",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 4. Cancel Subscription

**Endpoint:** `POST /api/subscription/cancel`  
**Purpose:** Cancel subscription at end of billing period  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface CancelSubscriptionRequest {
  reason?: string;     // Optional feedback
  immediate?: boolean; // Optional, default: false (cancel at period end)
}
```

**Example Request:**
```json
{
  "reason": "Too expensive",
  "immediate": false
}
```

#### Response (200 OK)

```typescript
interface CancelSubscriptionResponse {
  message: string;
  subscription: {
    status: 'active' | 'canceled';
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;  // ISO 8601
  };
}
```

**Example Response (Cancel at Period End):**
```json
{
  "message": "Subscription will be cancelled at the end of the current billing period",
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2025-11-23T10:30:00Z"
  }
}
```

**Example Response (Immediate Cancellation):**
```json
{
  "message": "Subscription cancelled immediately",
  "subscription": {
    "status": "canceled",
    "cancelAtPeriodEnd": false,
    "currentPeriodEnd": "2025-10-23T10:30:00Z"
  }
}
```

#### Error Responses

**404 Not Found - No Active Subscription**
```json
{
  "error": "no_active_subscription",
  "message": "You don't have an active subscription to cancel",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 5. Reactivate Subscription

**Endpoint:** `POST /api/subscription/reactivate`  
**Purpose:** Reactivate a cancelled subscription before period end  
**Authentication:** Required (Bearer token)

#### Request

No body required.

#### Response (200 OK)

```typescript
interface ReactivateSubscriptionResponse {
  message: string;
  subscription: {
    status: 'active';
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  };
}
```

**Example Response:**
```json
{
  "message": "Subscription reactivated successfully",
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": false,
    "currentPeriodEnd": "2025-11-23T10:30:00Z"
  }
}
```

#### Error Responses

**404 Not Found - No Subscription to Reactivate**
```json
{
  "error": "no_subscription_to_reactivate",
  "message": "You don't have a cancelled subscription to reactivate",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**409 Conflict - Already Active**
```json
{
  "error": "already_active",
  "message": "Your subscription is already active",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 6. Stripe Webhook Handler

**Endpoint:** `POST /api/subscription/webhook`  
**Purpose:** Handle Stripe webhook events (subscription lifecycle)  
**Authentication:** Stripe signature verification (not user auth)

#### Request

**Headers:**
- `Stripe-Signature`: Webhook signature for verification

**Body:** Stripe event object (raw JSON)

#### Webhook Events Handled

| Event Type | Action |
|------------|--------|
| `checkout.session.completed` | Create or update subscription record |
| `customer.subscription.created` | Create subscription record |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark subscription as cancelled |
| `invoice.payment_succeeded` | Extend subscription period |
| `invoice.payment_failed` | Mark subscription as past_due |
| `customer.subscription.trial_will_end` | Send notification (future) |

#### Response (200 OK)

```typescript
interface WebhookResponse {
  received: boolean;
  event: string;     // Event type
  processed: boolean;
}
```

**Example Response:**
```json
{
  "received": true,
  "event": "checkout.session.completed",
  "processed": true
}
```

#### Error Responses

**400 Bad Request - Invalid Signature**
```json
{
  "error": "invalid_signature",
  "message": "Webhook signature verification failed",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**400 Bad Request - Invalid Event**
```json
{
  "error": "invalid_event",
  "message": "Event data is invalid or malformed",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

## Webhook Event Processing

### checkout.session.completed

**Purpose:** User completed checkout, create subscription

**Processing Steps:**
1. Extract customer ID and subscription ID from event
2. Get user ID from metadata
3. Create subscription record in database
4. Update user's account type to 'premium'
5. Send confirmation email (optional)

**Event Data:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "customer": "cus_...",
      "subscription": "sub_...",
      "metadata": {
        "user_id": "550e8400-..."
      }
    }
  }
}
```

---

### customer.subscription.updated

**Purpose:** Subscription status changed (renewed, cancelled, etc.)

**Processing Steps:**
1. Find subscription by stripe_subscription_id
2. Update status, period dates, cancel_at_period_end
3. Update user's account type if status changed to inactive

**Event Data:**
```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_...",
      "status": "active",
      "current_period_start": 1698067200,
      "current_period_end": 1700745600,
      "cancel_at_period_end": false
    }
  }
}
```

---

### invoice.payment_failed

**Purpose:** Payment failed, mark subscription as past_due

**Processing Steps:**
1. Find subscription by customer ID
2. Update status to 'past_due'
3. Send payment failure notification (optional)
4. After 3 failed attempts, cancel subscription

**Event Data:**
```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "customer": "cus_...",
      "subscription": "sub_...",
      "attempt_count": 1
    }
  }
}
```

---

## Subscription Plans Configuration

### Monthly Plan

**Price:** $19.99/month  
**Stripe Price ID:** `price_monthly_premium`  
**Billing Interval:** Monthly  
**Features:**
- Unlimited rounds
- Premium voice (ElevenLabs)
- Reward regeneration
- Advanced stats
- Priority support

### Yearly Plan

**Price:** $179.99/year ($14.99/month equivalent)  
**Stripe Price ID:** `price_yearly_premium`  
**Billing Interval:** Yearly  
**Savings:** $60/year (25% off)  
**Features:** Same as monthly

---

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful checkout creation, status retrieval, cancellation |
| 400 | Bad Request | Invalid price ID, invalid webhook signature |
| 401 | Unauthorized | Missing or invalid auth token |
| 404 | Not Found | No subscription found |
| 409 | Conflict | Already subscribed, already active |
| 500 | Internal Server Error | Stripe API error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /create-checkout` | 5 requests | 5 minutes per user |
| `GET /status` | 60 requests | 1 minute per user |
| `POST /create-portal` | 10 requests | 5 minutes per user |
| `POST /cancel` | 3 requests | 10 minutes per user |
| `POST /reactivate` | 3 requests | 10 minutes per user |
| `POST /webhook` | Unlimited | N/A (Stripe sends) |

---

## Integration Notes

### Backend Implementation

```typescript
// src/app/api/subscription/create-checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { priceId, successUrl, cancelUrl } = await request.json();
  
  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Check if already subscribed
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  
  if (existingSub) {
    return Response.json({ error: 'already_subscribed' }, { status: 409 });
  }
  
  // 3. Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}${successUrl || '/success'}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${cancelUrl || '/pricing'}`,
    metadata: { user_id: user.id },
  });
  
  return Response.json({
    checkoutUrl: session.url,
    sessionId: session.id,
  });
}
```

### Webhook Implementation

```typescript
// src/app/api/subscription/webhook/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
  
  return Response.json({ received: true, event: event.type, processed: true });
}
```

### Frontend Implementation

```typescript
// src/lib/api/subscription.ts
import { useMutation, useQuery } from '@tanstack/react-query';

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
      return checkoutUrl;
    },
  });
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/subscription/status');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
```

---

## Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_MONTHLY=price_1234567890abcdef
STRIPE_PRICE_YEARLY=price_0987654321fedcba

# App URLs
NEXT_PUBLIC_APP_URL=https://charmdojo.com
```

---

## Testing Checklist

### Checkout Flow
- [ ] Create checkout session with valid price ID
- [ ] Redirect to Stripe Checkout
- [ ] Handle successful checkout webhook
- [ ] Create subscription record in database
- [ ] Update user account type to premium
- [ ] Already subscribed returns 409

### Subscription Status
- [ ] Free tier user returns null subscription
- [ ] Active premium user returns subscription data
- [ ] Cancelled subscription shows cancel_at_period_end
- [ ] Past_due status reflected correctly

### Customer Portal
- [ ] Portal session created for subscribed user
- [ ] Portal session fails for free tier user (404)
- [ ] User can manage payment methods in portal
- [ ] User can cancel subscription in portal

### Cancellation
- [ ] Cancel at period end works correctly
- [ ] Immediate cancellation works
- [ ] Reactivation works before period end
- [ ] User downgraded to free tier after cancellation
- [ ] Cancellation reason logged

### Webhooks
- [ ] Valid webhook signature accepted
- [ ] Invalid signature rejected (400)
- [ ] checkout.session.completed creates subscription
- [ ] customer.subscription.updated syncs status
- [ ] invoice.payment_failed marks as past_due
- [ ] customer.subscription.deleted removes premium access
- [ ] Idempotency prevents duplicate processing

### Edge Cases
- [ ] Subscription renewal handled correctly
- [ ] Failed payments after 3 attempts cancel subscription
- [ ] Prorated refunds processed correctly
- [ ] User can upgrade from monthly to yearly
- [ ] User can downgrade from yearly to monthly


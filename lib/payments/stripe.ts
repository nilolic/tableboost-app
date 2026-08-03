import Stripe from 'stripe'
import { PaymentProvider } from './provider'
import { CreateIntentParams, PaymentIntentResult, PaymentStatus } from './types'

export class StripeProvider implements PaymentProvider {
  name = 'stripe' as const
  private stripe: Stripe

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' as any })
  }

  async createIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    const amountCents = Math.round(params.amount * 100)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://tableboost.hr'

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (params.currency || 'eur').toLowerCase(),
            product_data: {
              name: `Narudžba ${params.orderId.slice(0,8)}`,
              description: `TableBoost - ${params.restaurantId.slice(0,8)}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/order/${params.orderId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/menu/${params.restaurantSlug || params.orderId}?canceled=1`,
      metadata: {
        orderId: params.orderId,
        restaurantId: params.restaurantId,
      },
    })

    return {
      provider: 'stripe',
      intentId: session.id,
      checkoutUrl: session.url || undefined,
      clientSecret: session.id,
      status: 'PENDING' as PaymentStatus,
    }
  }

  async verifyPayment(intentId: string): Promise<PaymentStatus> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(intentId)
      if (session.payment_status === 'paid') return 'PAID'
      if (session.status === 'complete') return 'PAID'
      return 'PENDING'
    } catch {
      return 'PENDING'
    }
  }
  getStripe() { return this.stripe }
}

import { MockProvider } from './mock'
import { StripeProvider } from './stripe'
import { PaymentProvider } from './provider'

export function getPaymentProvider(restaurant: any): PaymentProvider {
  if (!restaurant?.paymentCardOnlineEnabled) {
    return new MockProvider()
  }
  if (!restaurant?.stripeSecretKey) {
    return new MockProvider()
  }
  try {
    return new StripeProvider(restaurant.stripeSecretKey)
  } catch (e) {
    console.error('Stripe init failed, fallback to mock', e)
    return new MockProvider()
  }
}

export { StripeProvider } from './stripe'
export { MockProvider } from './mock'

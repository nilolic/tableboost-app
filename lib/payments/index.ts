import { MockProvider } from './mock'
import { PaymentProvider } from './provider'

export function getPaymentProvider(restaurant: any): PaymentProvider {
  // Za sad uvijek mock - kad dodaš stripe ključ, ovdje ćemo vratiti StripeProvider
  if (!restaurant?.paymentCardOnlineEnabled) {
    return new MockProvider()
  }
  if (!restaurant?.stripeSecretKey) {
    return new MockProvider()
  }
  // TODO: return new StripeProvider(restaurant.stripeSecretKey)
  return new MockProvider()
}

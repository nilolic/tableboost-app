export type PaymentMethod = 'CASH' | 'CARD_TERMINAL' | 'CARD_ONLINE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED'
export type PaymentProviderName = 'mock' | 'stripe' | 'monri' | 'wspay'

export interface CreateIntentParams {
  orderId: string
  amount: number
  currency?: string
  restaurantId: string
  restaurantSlug?: string
}

export interface PaymentIntentResult {
  provider: PaymentProviderName
  intentId: string
  clientSecret?: string
  checkoutUrl?: string
  status: PaymentStatus
}

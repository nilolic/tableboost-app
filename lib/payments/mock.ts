import { PaymentProvider } from './provider'
import { CreateIntentParams, PaymentIntentResult } from './types'

export class MockProvider implements PaymentProvider {
  name = 'mock' as const
  async createIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    return {
      provider: 'mock',
      intentId: `mock_${Date.now()}`,
      clientSecret: `mock_secret_${params.orderId}`,
      status: 'PENDING'
    }
  }
  async verifyPayment(intentId: string) {
    return 'PAID' as const
  }
}

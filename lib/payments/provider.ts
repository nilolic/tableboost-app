import { CreateIntentParams, PaymentIntentResult, PaymentStatus } from './types'

export interface PaymentProvider {
  name: string
  createIntent(params: CreateIntentParams): Promise<PaymentIntentResult>
  verifyPayment(intentId: string): Promise<PaymentStatus>
  refund?(intentId: string, amount?: number): Promise<boolean>
}

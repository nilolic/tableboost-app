import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PaymentsClient from './PaymentsClient'

export default async function Page() {
  const cur = await getCurrentUser()
  if (!cur?.restaurantId) redirect('/login')
  const r = await prisma.restaurant.findUnique({ where: { id: cur.restaurantId } })
  if (!r) redirect('/login')
  return <PaymentsClient initial={{
    paymentCashEnabled: r.paymentCashEnabled,
    paymentCardTerminalEnabled: r.paymentCardTerminalEnabled,
    paymentCardOnlineEnabled: r.paymentCardOnlineEnabled,
    paymentProvider: r.paymentProvider,
    paymentTestMode: r.paymentTestMode,
    stripePublicKey: r.stripePublicKey,
    hasSecret:!!r.stripeSecretKey
  }} />
}

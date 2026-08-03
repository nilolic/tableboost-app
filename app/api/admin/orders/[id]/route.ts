import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, cancelReason } = body
    const id = params.id
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (status === 'cancelled') {
      const method = (order.paymentMethod || "").toUpperCase()
      const isOnline = method.includes("ONLINE") || method.includes("STRIPE") || method.includes("CARD")
      const isPaid = (order.paymentStatus || "").toUpperCase() === "PAID"
      let refundUpdate: any = {}
      if (isOnline && isPaid) {
        try {
          if (!process.env.STRIPE_SECRET_KEY) throw new Error("No STRIPE_SECRET_KEY")
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" as any })
          const piId = (order as any).paymentIntentId
          const chargeId = (order as any).stripeChargeId
          let refund
          if (piId) {
            refund = await stripe.refunds.create({ payment_intent: piId, reason: "requested_by_customer", metadata: { orderId: order.id, reason: cancelReason || "" } })
          } else if (chargeId) {
            refund = await stripe.refunds.create({ charge: chargeId, reason: "requested_by_customer" })
          } else {
            throw new Error("Nema paymentIntentId za refund")
          }
          refundUpdate = { refundId: refund.id, refundStatus: refund.status, paymentStatus: "REFUNDED" }
        } catch (e: any) {
          console.error("Stripe refund failed:", e.message)
          refundUpdate = { refundStatus: "FAILED: " + (e.message || "unknown") }
        }
      }
      const updated = await prisma.order.update({
        where: { id },
        data: { status: "cancelled", cancelReason: cancelReason || null, cancelledAt: new Date(),...refundUpdate }
      })
      return NextResponse.json({ order: updated })
    }
    const updated = await prisma.order.update({ where: { id }, data: { status } })
    return NextResponse.json({ order: updated })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Greska" }, { status: 500 })
  }
}

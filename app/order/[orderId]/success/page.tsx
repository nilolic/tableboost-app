import { prisma } from "@/lib/prisma"
import SuccessClient from "./SuccessClient"
export default async function SuccessPage({ params }: { params: { orderId: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { restaurant: true, table: true, items: { include: { menuItem: true } } }
  })
  if(!order) return <div className="p-10 text-center">Narudžba nije pronađena</div>
  return <SuccessClient order={order} />
}

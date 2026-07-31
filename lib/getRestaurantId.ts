export function getRestaurantId(user: any, impersonateId?: string | null) {
  if (user?.role === 'SUPER_ADMIN' && impersonateId) {
    return impersonateId
  }
  return user?.restaurantId || null
}

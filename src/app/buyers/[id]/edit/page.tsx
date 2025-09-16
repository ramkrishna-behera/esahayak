'use client'

import { useParams } from 'next/navigation'
import { useBuyerAccess } from '@/hooks/useBuyerAccess'
import { PrefilledEdit } from './PreFilledEdit'

export default function BuyerEditPage() {
  const { id } = useParams<{ id: string }>()
  const {
    loading,
    userAccess,
    buyerId,
    ownerId,
    currentUserId,
    currentUserRole,
  } = useBuyerAccess(id)

  if (loading) return <p>Loading…</p>

  return (
    <main>
      {userAccess ? (
        buyerId ? (
          <div>
            <PrefilledEdit buyerId={buyerId} />
          </div>
        ) : (
          <p className="mt-4 text-red-600">
            Buyer ID is missing.
          </p>
        )
      ) : (
        <p className="mt-4 text-red-600">
          Only the owner or an admin can edit this buyer.
        </p>
      )}
    </main>
  )
}

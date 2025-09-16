// hooks/useBuyerAccess.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type User = { id: string; role: string }

export function useBuyerAccess(buyerId: string | undefined) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userAccess, setUserAccess] = useState(false)

  // --- read local user ---
  useEffect(() => {
    const raw = localStorage.getItem('currentUser')
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw))
      } catch (e) {
        console.error('Invalid currentUser in localStorage', e)
      }
    }
  }, [])

  // --- fetch buyer's owner from DB ---
  useEffect(() => {
    if (!buyerId) return
    const fetchOwner = async () => {
      const { data, error } = await supabase
        .from('buyers')
        .select('ownerid')
        .eq('id', buyerId)
        .single()

      if (!error && data) setOwnerId(data.ownerid)
      setLoading(false)
    }
    fetchOwner()
  }, [buyerId])

  // --- decide access ---
  useEffect(() => {
    if (!currentUser || !ownerId) return
    setUserAccess(
      currentUser.role === 'admin' || currentUser.id === ownerId
    )
  }, [currentUser, ownerId])

  return {
    loading,
    userAccess,
    buyerId,                       // always returned
    ownerId,                       // always returned
    currentUserId: currentUser?.id ?? null,
    currentUserRole: currentUser?.role ?? null,
  }
}

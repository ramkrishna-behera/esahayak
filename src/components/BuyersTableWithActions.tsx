// components/BuyersTableWithActions.tsx
"use client"

import { useRouter } from "next/navigation"
import BuyersTable from "./BuyersTable"
import { type Buyer } from "./BuyersTable" // import the type

type Props = {
  buyers: Buyer[]
  loading?: boolean
}

export function BuyersTableWithActions({ buyers, loading }: Props) {
  const router = useRouter()

  return (
    <BuyersTable
      buyers={buyers}
      loading={loading}
      onView={(id) => router.push(`/buyers/${id}`)}
      onEdit={(id) => router.push(`/buyers/${id}/edit`)}
    />
  )
}

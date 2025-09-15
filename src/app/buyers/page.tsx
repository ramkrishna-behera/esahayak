// app/buyers/page.tsx
import { supabase } from "@/lib/supabaseClient"
import BuyersTable from "@/components/BuyersTable"
import { Pagination } from "@/components/Pagination"
import { Filters } from "@/components/Filter"
import { Users } from "lucide-react"
import { BuyersTableWithActions } from "@/components/BuyersTableWithActions"
import AuthGuard from "@/components/AuthGuard"

const pageSize = 10

type Props = {
  searchParams: {
    page?: string
    q?: string
    city?: string
    propertyType?: string
    status?: string
    timeline?: string
  }
}

export default async function BuyersPage({ searchParams }: Props) {

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1
  const q = searchParams.q || ""
  const { city, propertyType, status, timeline } = searchParams

  let query = supabase
    .from("buyers")
    .select("*", { count: "exact" })
    .order("updatedat", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (q) {
    // search across multiple fields
    query = query.or(`fullname.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
  }
  if (city) query = query.eq("city", city)
  if (propertyType) query = query.eq("propertytype", propertyType)
  if (status) query = query.eq("status", status)
  if (timeline) query = query.eq("timeline", timeline)

  const { data: buyers, count, error } = await query

  if (error) {
    console.error("Error fetching buyers:", error.message)
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <AuthGuard>
        <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Buyers
          </h1>
          <p className="text-muted-foreground text-sm">Manage and track your buyer leads efficiently</p>
        </div>
      </div>

      {/* Filters */}
      <Filters initialQuery={q} city={city} propertyType={propertyType} status={status} timeline={timeline} />

      {/* Table */}
      {/* Table (client wrapper with router actions) */}
      <BuyersTableWithActions buyers={buyers || []} loading={!buyers} />

      {/* Pagination */}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
    </AuthGuard>
  )
}

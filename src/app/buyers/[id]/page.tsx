// app/buyers/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, Pencil } from "lucide-react"
import Link from "next/link"

type Buyer = {
  id: string
  fullname: string
  email?: string | null
  phone: string
  city: string
  propertytype: string
  bhk?: string | null
  purpose?: string | null
  budgetmin?: number | null
  budgetmax?: number | null
  timeline?: string | null
  source?: string | null
  status?: string | null
  notes?: string | null
  tags?: string | null
  ownerid?: string | null
  updatedat?: string | null
}

type BuyerHistory = {
  id: string
  buyerid: string
  changedby: string
  changedat: string
  diff: any
}

interface Props {
  params: { id: string }
}

const formatCurrency = (amount?: number | null) => {
  if (amount == null) return "-"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Parse diff JSON safely
type DiffField = {
  old?: any
  new?: any
}

const parseDiff = (diff: string | Record<string, { old?: any; new?: any }>): string => {
  try {
    let obj: Record<string, { old?: any; new?: any }> = {}

    if (typeof diff === "string") {
      obj = JSON.parse(diff)
    } else if (typeof diff === "object" && diff !== null) {
      obj = diff
    } else {
      return "-"
    }

    return Object.entries(obj)
      .map(([field, change]) => {
        const oldVal =
          change?.old !== undefined
            ? typeof change.old === "object"
              ? JSON.stringify(change.old)
              : change.old
            : "-"
        const newVal =
          change?.new !== undefined
            ? typeof change.new === "object"
              ? JSON.stringify(change.new)
              : change.new
            : "-"
        return `${field}: ${oldVal} → ${newVal}`
      })
      .join(", ") // join as a single string for React
  } catch (err) {
    return typeof diff === "string" ? diff : JSON.stringify(diff)
  }
}






export default async function BuyerPage({ params }: Props) {
  const { id } = params

  // Fetch buyer info
  const { data: buyersData, error: buyersError } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single()

  if (buyersError || !buyersData) {
    return <div className="p-6 text-center text-red-500">Buyer not found</div>
  }

  // Fetch last 5 history records
  const { data: historyData } = await supabase
    .from("buyer_history")
    .select("*")
    .eq("buyerid", id)
    .order("changedat", { ascending: false })
    .limit(5)

  const b = buyersData

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Header with Edit button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{b.fullname}</h1>
        <Link href={`/buyers/${id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Buyer Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          ["Full Name", b.fullname],
          ["Email", b.email ?? "-"],
          ["Phone", b.phone],
          ["City", b.city],
          ["Property Type", b.propertytype],
          ["BHK", b.bhk ?? "-"],
          ["Purpose", b.purpose ?? "-"],
          [
            "Budget",
            `${formatCurrency(b.budgetmin)} ${
              b.budgetmin != null || b.budgetmax != null ? "—" : ""
            } ${formatCurrency(b.budgetmax)}`,
          ],
          ["Timeline", b.timeline ?? "-"],
          ["Source", b.source ?? "-"],
          ["Status", b.status ?? "-"],
          [
            "Updated At",
            <div className="flex items-center gap-1" key="updated">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatDateTime(b.updatedat)}
            </div>,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="">{value}</div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <h2 className="text-lg font-semibold mb-2">Change History (last 5)</h2>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Changed At</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData && historyData.length > 0 ? (
              historyData.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{formatDateTime(h.changedat)}</TableCell>
                  <TableCell>{h.changedby}</TableCell>
                                        <TableCell>{parseDiff(h.diff)}</TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, MoreHorizontal, MoreVertical } from "lucide-react"

export type Buyer = {
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
  updatedat?: string | null
}

type Props = {
  buyers: Buyer[]
  loading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

const formatCurrency = (amount?: number | null) => {
  if (amount == null) return "-"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (iso?: string | null) => {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function BuyersTable({ buyers, loading = false, onView, onEdit }: Props) {
  if (loading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
  }

  if (!buyers || buyers.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">No buyers found.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Property Type</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            {(onView || onEdit) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {buyers.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <div className="font-medium">{b.fullname}</div>
                {b.email && <div className="text-sm text-muted-foreground">{b.email}</div>}
              </TableCell>
              <TableCell>{b.phone}</TableCell>
              <TableCell>{b.city}</TableCell>
              <TableCell>{b.propertytype}</TableCell>
              <TableCell>
                {formatCurrency(b.budgetmin)}{" "}
                {b.budgetmin != null || b.budgetmax != null ? "—" : ""}{" "}
                {formatCurrency(b.budgetmax)}
              </TableCell>
              <TableCell>{b.timeline ?? "-"}</TableCell>
              <TableCell>{b.status ?? "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(b.updatedat)}
              </TableCell>

              {(onView || onEdit) && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(b.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(b.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

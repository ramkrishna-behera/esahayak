// components/Pagination.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Prev</span>
      </Button>

      <span className="text-sm text-muted-foreground">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

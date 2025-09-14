"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Search } from "lucide-react"

const cities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]
const propertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"]
const statuses = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]
const timelines = ["0-3m", "3-6m", ">6m", "Exploring"]

export function Filters({ initialQuery = "__all__", city, propertyType, status, timeline }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialQuery)

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set("q", search)
      else params.delete("q")
      params.set("page", "1") // reset page
      router.push(`?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1") // reset page
    router.push(`?${params.toString()}`)
  }

  const clearAll = () => router.push("/buyers")

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* City */}
      <Select value={city || "__all__"} onValueChange={(v) => updateFilter("city", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Cities</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Property Type */}
      <Select value={propertyType || "__all__"} onValueChange={(v) => updateFilter("propertyType", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Types</SelectItem>
          {propertyTypes.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status || "__all__"} onValueChange={(v) => updateFilter("status", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Timeline */}
      <Select value={timeline || "__all__"} onValueChange={(v) => updateFilter("timeline", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Timelines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Timelines</SelectItem>
          {timelines.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear All */}
      <Button
        onClick={clearAll}
        variant="outline"
        className="flex items-center gap-1"
      >
        <X className="w-4 h-4" /> Clear
      </Button>
    </div>
  )
}

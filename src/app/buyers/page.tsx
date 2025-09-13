
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Buyer = {
  id: string
  fullname: string
  email: string
  phone: string
  city: string
  propertytype: string
  bhk: string
  purpose: string
  budgetmin: number
  budgetmax: number
  timeline: string
  source: string
  status: string
  updatedat: string
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [status, setStatus] = useState("")
  const [timeline, setTimeline] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  const cities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]
  const propertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"]
  const statuses = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]
  const timelines = ["0-3m", "3-6m", ">6m", "Exploring"]

  const fetchBuyers = async () => {
    setLoading(true)

    let query = supabase
      .from("buyers")
      .select("*", { count: "exact" })
      .order("updatedat", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.ilike("fullname", `%${search}%`)
    }

    if (city) query = query.eq("city", city)
    if (propertyType) query = query.eq("propertytype", propertyType)
    if (status) query = query.eq("status", status)
    if (timeline) query = query.eq("timeline", timeline)

    const { data, count, error } = await query

    if (error) {
      console.error("Error fetching buyers:", error.message)
    } else {
      setBuyers(data || [])
      setTotal(count || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchBuyers()
  }, [search, city, propertyType, status, timeline, page])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <p className="text-sm text-gray-500">Manage your buyer leads</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="border rounded p-2">
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="border rounded p-2">
          <option value="">All Types</option>
          {propertyTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="border rounded p-2">
          <option value="">All Timelines</option>
          {timelines.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("")
            setCity("")
            setPropertyType("")
            setStatus("")
            setTimeline("")
            setPage(1)
          }}
          className="border rounded p-2 bg-gray-200"
        >
          Clear All
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border-collapse border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">City</th>
              <th className="border p-2">Property Type</th>
              <th className="border p-2">Budget</th>
              <th className="border p-2">Timeline</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((b) => (
              <tr key={b.id}>
                <td className="border p-2">
                  {b.fullname}
                  <br />
                  <small className="text-gray-500">{b.email}</small>
                </td>
                <td className="border p-2">{b.phone}</td>
                <td className="border p-2">{b.city}</td>
                <td className="border p-2">{b.propertytype}</td>
                <td className="border p-2">
                  {b.budgetmin} - {b.budgetmax}
                </td>
                <td className="border p-2">{b.timeline}</td>
                <td className="border p-2">{b.status}</td>
                <td className="border p-2">{new Date(b.updatedat).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 border rounded">
            {"<<"}
          </button>
          <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 border rounded">
            {"<"}
          </button>
          <span className="p-2">
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-2 border rounded">
            {">"}
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 border rounded">
            {">>"}
          </button>
        </div>
      )}
    </div>
  )
}

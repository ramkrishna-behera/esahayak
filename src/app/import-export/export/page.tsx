"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, Search as SearchIcon, RotateCcw } from "lucide-react";
import Papa from "papaparse";

// --- Dropdown options
const cities = ["All", "Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const propertyTypes = ["All", "Apartment", "Villa", "Plot", "Office", "Retail"];
const statuses = [
  "All",
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];
const timelines = ["All", "0-3m", "3-6m", ">6m", "Exploring"];
const sortOptions = [
  { label: "Updated At (desc)", value: "updatedat:desc" },
  { label: "Updated At (asc)", value: "updatedat:asc" },
];

// --- Columns we want to show in preview
const previewHeaders = [
  "Name",
  "Phone",
  "City",
  "Property Type",
  "Budget",
  "Timeline",
  "Status",
];

export default function BuyersExportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters state
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "All");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") ?? "All"
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "All");
  const [timeline, setTimeline] = useState(searchParams.get("timeline") ?? "All");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "updatedat:desc");

  const [loading, setLoading] = useState(false);
  const [lastExportCount, setLastExportCount] = useState<number | null>(null);

  const [buyers, setBuyers] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false); // control when to show preview

  // Debounced update URL params
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (city && city !== "All") params.set("city", city);
      if (propertyType && propertyType !== "All")
        params.set("propertyType", propertyType);
      if (status && status !== "All") params.set("status", status);
      if (timeline && timeline !== "All") params.set("timeline", timeline);
      if (sort) params.set("sort", sort);

      router.replace(`?${params.toString()}`);
      setHasAppliedFilter(
        !!q ||
          city !== "All" ||
          propertyType !== "All" ||
          status !== "All" ||
          timeline !== "All"
      );
    }, 400);
    return () => clearTimeout(t);
  }, [q, city, propertyType, status, timeline, sort, router]);

  // Supabase query builder
  const buildQuery = () => {
    let query = supabase.from("buyers").select("*");

    if (q) {
      query = query.or(
        `fullname.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`
      );
    }
    if (city && city !== "All") query = query.eq("city", city);
    if (propertyType && propertyType !== "All")
      query = query.eq("propertytype", propertyType);
    if (status && status !== "All") query = query.eq("status", status);
    if (timeline && timeline !== "All") query = query.eq("timeline", timeline);

    const [field, dir] = (sort || "updatedat:desc").split(":");
    query = query.order(field, { ascending: dir === "asc" });

    return query;
  };

  // Fetch preview when filters applied
  useEffect(() => {
    const fetchPreview = async () => {
      if (!hasAppliedFilter) {
        setBuyers([]);
        return;
      }
      setPreviewLoading(true);
      const { data, error } = await buildQuery().limit(5);
      if (!error) setBuyers(data ?? []);
      setPreviewLoading(false);
    };
    fetchPreview();
  }, [hasAppliedFilter, q, city, propertyType, status, timeline, sort]);

  // Normalize row for CSV
  const normalizeForCsv = (raw: any) => {
    return {
      Name: raw.fullname ?? "",
      Phone: raw.phone ?? "",
      City: raw.city ?? "",
      "Property Type": raw.propertytype ?? "",
      Budget: [raw.budgetmin, raw.budgetmax].filter(Boolean).join(" - "),
      Timeline: raw.timeline ?? "",
      Status: raw.status ?? "",
    };
  };

  // Export CSV
  const handleExport = async () => {
    setLoading(true);
    setLastExportCount(null);

    try {
      const { data, error } = await buildQuery();
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) {
        alert("No buyers found for current filters.");
        setLoading(false);
        return;
      }

      const normalized = rows.map(normalizeForCsv);

      const csv = Papa.unparse({
        fields: previewHeaders,
        data: normalized.map((r) => previewHeaders.map((h) => (r as any)[h])),
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `buyers_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExportCount(normalized.length);
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Export failed: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Reset filters & preview
  const resetFilters = () => {
    setQ("");
    setCity("All");
    setPropertyType("All");
    setStatus("All");
    setTimeline("All");
    setSort("updatedat:desc");
    setBuyers([]);
    setHasAppliedFilter(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-6">Export Buyers</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search name, phone or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Sort</label>
          <Select value={sort} onValueChange={(v) => setSort(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">City</label>
            <Select value={city} onValueChange={(v) => setCity(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Property Type
            </label>
            <Select value={propertyType} onValueChange={(v) => setPropertyType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Timeline</label>
            <Select value={timeline} onValueChange={(v) => setTimeline(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Timelines" />
              </SelectTrigger>
              <SelectContent>
                {timelines.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={handleExport} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </>
          )}
        </Button>

        <Button variant="outline" onClick={resetFilters}>
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Filters
        </Button>

        {lastExportCount !== null && (
          <div className="text-sm text-muted-foreground">
            Exported {lastExportCount} rows
          </div>
        )}
      </div>

      {/* Preview */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Preview (first 5 rows)</h2>
        {previewLoading ? (
          <p className="text-sm text-muted-foreground">Loading preview…</p>
        ) : buyers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasAppliedFilter
              ? "No buyers match filters."
              : "No data shown. Apply filters or search to preview."}
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted">
                <tr>
                  {previewHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium text-muted-foreground border-b"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buyers.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="px-3 py-2 border-b">{row.fullname ?? ""}</td>
                    <td className="px-3 py-2 border-b">{row.phone ?? ""}</td>
                    <td className="px-3 py-2 border-b">{row.city ?? ""}</td>
                    <td className="px-3 py-2 border-b">{row.propertytype ?? ""}</td>
                    <td className="px-3 py-2 border-b">
                      {[row.budgetmin, row.budgetmax].filter(Boolean).join(" - ")}
                    </td>
                    <td className="px-3 py-2 border-b">{row.timeline ?? ""}</td>
                    <td className="px-3 py-2 border-b">{row.status ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

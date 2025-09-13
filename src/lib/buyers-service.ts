// lib/buyers-service.ts
import { supabase } from "@/lib/supabaseClient";

export type BuyersResult = {
  buyers: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

interface BuyersFilters {
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
}

export async function getBuyers(
  page: number,
  pageSize: number,
  filters: BuyersFilters
): Promise<BuyersResult> {
  let query = supabase.from("buyers").select("*", { count: "exact" });

  // Search by fullname, phone, email
  if (filters.search) {
    query = query.or(
      `fullname.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  // Filters
  if (filters.city && filters.city !== "allCities") query = query.eq("city", filters.city);
  if (filters.propertyType && filters.propertyType !== "allTypes")
    query = query.eq("propertytype", filters.propertyType);
  if (filters.status && filters.status !== "allStatuses") query = query.eq("status", filters.status);
  if (filters.timeline && filters.timeline !== "allTimelines") query = query.eq("timeline", filters.timeline);

  // Sorting
  query = query.order("updatedat", { ascending: false });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    buyers: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Helpers for filters options
export function getCities() {
  return ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
}
export function getPropertyTypes() {
  return ["Apartment", "Villa", "Plot", "Office", "Retail"];
}
export function getStatuses() {
  return ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"];
}
export function getTimelines() {
  return ["0-3m", "3-6m", ">6m", "Exploring"];
}

// app/buyers/[id]/edit/page.tsx
"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loader2, Save, X } from "lucide-react"

// ------------------------------------------------------
// Schema
// ------------------------------------------------------
const buyerSchema = z.object({
  fullname: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10).max(15),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertytype: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetmin: z.coerce.number().int().nonnegative().optional(),
  budgetmax: z.coerce.number().int().nonnegative().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]),
  notes: z.string().max(1000).optional(),
  tags: z.string().optional(),
})

type BuyerForm = z.infer<typeof buyerSchema>

// ------------------------------------------------------
// Helper: buildDiff
// ------------------------------------------------------
function buildDiff(oldData: BuyerForm, newData: BuyerForm) {
  debugger
  console.log("🔍 buildDiff called")
  console.log("➡️ Old Data:", oldData)
  console.log("➡️ New Data:", newData)

  const diff: Record<string, { old: any; new: any }> = {}
  for (const key of Object.keys(newData) as (keyof BuyerForm)[]) {
    if (oldData[key] !== newData[key]) {
      console.log(`⚡ Field changed: ${key}`, {
        old: oldData[key],
        new: newData[key],
      })
      diff[key] = { old: oldData[key], new: newData[key] }
    }
  }

  console.log("✅ Final Diff:", diff)
  debugger
  return diff
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------
export default function BuyerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) as { id: string }
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [initialData, setInitialData] = useState<BuyerForm | null>(null)

  const form = useForm<BuyerForm>({
    resolver: zodResolver(buyerSchema) as any,
    defaultValues: {},
  })

  // ------------------------------------------------------
  // Fetch buyer + check auth
  // ------------------------------------------------------
  useEffect(() => {
    const fetchBuyer = async () => {
      console.log("🚀 Fetching buyer with ID:", id)
      debugger
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .single()

      console.log("📥 Supabase Response:", { data, error })
      debugger
      if (error || !data) {
        console.error("❌ Failed to fetch buyer:", error)
        setLoading(false)
        return
      }

      // Auth check
      try {
        const userStr = localStorage.getItem("currentUser")
        console.log("👤 Raw currentUser string from localStorage:", userStr)
        debugger
        if (userStr) {
          const currentUser = JSON.parse(userStr)
          console.log("👤 Parsed currentUser object:", currentUser)
          debugger
          if (
            currentUser?.id === data.ownerid ||
            currentUser?.role === "admin"
          ) {
            console.log("✅ Authorized user")
            setAuthorized(true)
          } else {
            console.warn("⛔ Unauthorized user")
          }
        }
      } catch (err) {
        console.error("❌ Auth check failed", err)
      }

      setCheckedAuth(true)
      setInitialData(data)
      console.log("📋 Setting initial form data:", data)
      form.reset(data)
      setLoading(false)
    }

    fetchBuyer()
  }, [id, form])

  // ------------------------------------------------------
  // Handle submit
  // ------------------------------------------------------
  const onSubmit = async (values: BuyerForm) => {
    console.log("📝 Form Submitted:", values)
    debugger
    if (!initialData) {
      console.error("❌ No initialData, cannot save")
      return
    }

    setLoading(true)
    const diff = buildDiff(initialData, values)

    if (Object.keys(diff).length === 0) {
      console.log("ℹ️ No changes detected, skipping update")
      debugger
      setLoading(false)
      router.push(`/buyers/${id}`)
      return
    }

    // Get current user
    let changedBy: string | null = null
    try {
      const userStr = localStorage.getItem("currentUser")
      console.log("👤 localStorage currentUser (raw):", userStr)
      debugger
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        console.log("👤 Parsed currentUser:", currentUser)
        debugger
        changedBy = currentUser?.id ?? null
      }
    } catch (err) {
      console.error("❌ Failed to parse currentUser", err)
    }

    // 1. Update buyers
    console.log("🛠 Updating buyers row with values:", values)
    const { error: updateError } = await supabase
      .from("buyers")
      .update({ ...values, updatedat: new Date().toISOString() })
      .eq("id", id)

    console.log("📤 Supabase Update Result:", { updateError })
    debugger
    if (updateError) {
      console.error("❌ Update error", updateError)
      setLoading(false)
      return
    }

    // 2. Insert into history
    console.log("🛠 Inserting history with diff:", diff)
    const { error: historyError } = await supabase.from("buyer_history").insert({
      buyerid: id,
      changedby: changedBy,
      diff,
    })

    console.log("📤 Supabase History Insert Result:", { historyError })
    debugger
    if (historyError) {
      console.error("❌ History insert error", historyError)
      setLoading(false)
      return
    }

    console.log("✅ Successfully updated buyer + history")
    router.push(`/buyers/${id}`)
  }

  // ------------------------------------------------------
  // Render states
  // ------------------------------------------------------
  if (loading || !checkedAuth) return <div className="p-6">Loading...</div>

  if (!authorized) {
    return (
      <div className="p-6 text-red-600 font-medium">
        Only the Lead owner or an Admin can edit this buyer.
      </div>
    )
  }

  console.log("📦 RHF form state:", form.formState)

  return (
    <div className="min-h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-6">Edit Buyer</h1>
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-300">
            ⚠️ This page is under construction. Save functionality is temporarily disabled.
        </div>

      <form
        onSubmit={form.handleSubmit((values) => {
            console.log("🚀 RHF handleSubmit triggered")
            console.log("📦 Values before onSubmit:", values)
            onSubmit(values) // call your real submit handler
        })}
        className="grid gap-4 sm:grid-cols-2"
        >

        {/* Full Name */}
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input {...form.register("fullname")} />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input type="email" {...form.register("email")} />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input {...form.register("phone")} />
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-medium">City</label>
          <Select
            onValueChange={(v) =>
              form.setValue("city", v as BuyerForm["city"])
            }
            defaultValue={form.getValues("city")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-sm font-medium">Property Type</label>
          <Select
            onValueChange={(v) =>
              form.setValue("propertytype", v as BuyerForm["propertytype"])
            }
            defaultValue={form.getValues("propertytype")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {["Apartment", "Villa", "Plot", "Office", "Retail"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea rows={3} {...form.register("notes")} />
        </div>

        {/* Buttons */}
        <div className="sm:col-span-2 flex gap-2 mt-4">
          <Button type="submit" disabled>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/buyers/${id}`)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}




// Perfect 👍 thanks for the detailed breakdown and for sharing the model + current `/buyers/[id]` page.

// Let me summarize your **requirements for `/buyers/[id]/edit`** so I don’t miss anything:

// 1. ✅ Navigation: Clicking the **Edit** button on view page goes to `/buyers/[id]/edit`.
//    (Yes, that’s the recommended UX in Next.js App Router.)

// 2. ✅ UI/UX:

//    * Layout/design stays exactly the same as the view page.
//    * Only the values turn into editable input fields.
//    * Different labels → different inputs (`Input`, `Textarea`, `Select`, etc., from shadcn).
//    * Smooth transition — no “new card layout,” just inline form-like view.

// 3. ❌ History: Not shown on Edit page.

// 4. ✅ Actions:

//    * Save (validates, updates buyers row, inserts row in `buyer_history`, then redirects to `/buyers/[id]`).
//    * Cancel (goes back to `/buyers/[id]` without saving).

// 5. ✅ Validation: Zod schema directly from your **buyers** model:

//    * `fullName`: string, 2–80 chars
//    * `email`: email, optional
//    * `phone`: string, 10–15, required
//    * …and so on (with enum checks + budgetMin ≤ budgetMax).

// 6. ✅ `updatedAt`: should still be displayed at the bottom (read-only, even in edit).

// 7. ✅ Use **shadcn/ui** components + **lucide-react** icons.

// 8. ✅ Data layer:

//    * Update row in `buyers`
//    * Insert row in `buyer_history` with `{ "field": { "new": "X", "old": "Y" } }` object for each changed field.

//    For now, hardcode `changedby = "22222222-2222-2222-2222-222222222222"`.

// ---

// 🔑 One question before I draft the page:

// Do you want me to build the **diff-tracking function** (to compare old buyer vs. updated buyer and build the JSON object for `buyer_history`) as part of this edit page, or do you already have something for that?

// 👉 If not, I’ll write it so every time you save, it automatically generates the correct `diff` JSON and inserts into `buyer_history`.

// Should I go ahead and draft the **full `/buyers/[id]/edit` page** with:

// * Supabase server-side fetch (prefill data)
// * shadcn form with Zod + react-hook-form
// * Update + insert into history with generated diff
// * Save/Cancel buttons

// ?

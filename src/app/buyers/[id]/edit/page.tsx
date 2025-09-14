// app/buyers/[id]/edit/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

// 🔹 Validation Schema
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
  tags: z.string().optional(), // for now simple CSV input
})

type BuyerForm = z.infer<typeof buyerSchema>

export default function BuyerEditPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initialData, setInitialData] = useState<BuyerForm | null>(null)

  const form = useForm<BuyerForm>({
    resolver: zodResolver(buyerSchema) as any,
    defaultValues: {},
  })

  // Fetch buyer data
  useEffect(() => {
    const fetchBuyer = async () => {
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        console.error(error)
        return
      }
      setInitialData(data)
      form.reset(data) // fill form
      setLoading(false)
    }
    fetchBuyer()
  }, [id, form])

  // 🔹 Build diff object
  const buildDiff = (oldData: BuyerForm, newData: BuyerForm) => {
    const diff: Record<string, { old: any; new: any }> = {}
    for (const key of Object.keys(newData) as (keyof BuyerForm)[]) {
      if (oldData[key] !== newData[key]) {
        diff[key] = { old: oldData[key], new: newData[key] }
      }
    }
    return diff
  }

  const onSubmit = async (values: BuyerForm) => {
    if (!initialData) return
    setLoading(true)

    const diff = buildDiff(initialData, values)
    if (Object.keys(diff).length === 0) {
      setLoading(false)
      router.push(`/buyers/${id}`)
      return
    }

    // 1. Update buyers table
    const { error: updateError } = await supabase
      .from("buyers")
      .update({ ...values, updatedat: new Date().toISOString() })
      .eq("id", id)

    if (updateError) {
      console.error(updateError)
      setLoading(false)
      return
    }

    // 2. Insert into buyer_history
    const { error: historyError } = await supabase.from("buyer_history").insert({
      buyerid: id,
      changedby: "22222222-2222-2222-2222-222222222222",
      diff,
    })

    if (historyError) {
      console.error(historyError)
      setLoading(false)
      return
    }

    router.push(`/buyers/${id}`)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-6">Edit Buyer</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
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
          <Select onValueChange={(v) => form.setValue("city", v as BuyerForm["city"])} defaultValue={form.getValues("city")}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-sm font-medium">Property Type</label>
          <Select onValueChange={(v) => form.setValue("propertytype", v as BuyerForm["propertytype"])} defaultValue={form.getValues("propertytype")}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {["Apartment", "Villa", "Plot", "Office", "Retail"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
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
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/buyers/${id}`)}>
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

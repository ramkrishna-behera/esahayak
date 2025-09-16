"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Bed,
  Target,
  DollarSign,
  Clock,
  Users,
  Activity,
  FileText,
  Save,
  X,
} from "lucide-react"

export type Buyer = {
  id: string
  fullname: string
  email?: string
  phone: string
  city: "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other"
  propertytype: "Apartment" | "Villa" | "Plot" | "Office" | "Retail"
  bhk?: "1" | "2" | "3" | "4" | "Studio"
  purpose: "Buy" | "Rent"
  budgetmin?: number
  budgetmax?: number
  timeline: "0-3m" | "3-6m" | ">6m" | "Exploring"
  source: "Website" | "Referral" | "Walk-in" | "Call" | "Other"
  status: "New" | "Qualified" | "Contacted" | "Visited" | "Negotiation" | "Converted" | "Dropped"
  notes?: string
  tags?: string[]
  ownerid: string
  updatedat: string
}

type PrefilledEditProps = {
  buyerId: string
  onCancel?: () => void
}

export function PrefilledEdit({ buyerId, onCancel }: PrefilledEditProps) {
  const [form, setForm] = useState<Partial<Buyer>>({})
  const [oldData, setOldData] = useState<Partial<Buyer>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)

      if (buyerId === "demo-buyer-123") {
        // Demo data for preview
        const demoData: Partial<Buyer> = {
          id: "demo-buyer-123",
          fullname: "John Smith",
          email: "john.smith@example.com",
          phone: "+91 98765 43210",
          city: "Chandigarh",
          propertytype: "Apartment",
          bhk: "3",
          purpose: "Buy",
          budgetmin: 5000000,
          budgetmax: 8000000,
          timeline: "3-6m",
          source: "Website",
          status: "Qualified",
          notes:
            "Looking for a spacious 3BHK apartment in a good locality with modern amenities. Prefers properties near IT parks.",
          ownerid: "demo-owner",
          updatedat: new Date().toISOString(),
        }

        if (!ignore) {
          setForm(demoData)
          setOldData(demoData)
          setLoading(false)
        }
        return
      }

      // Original Supabase logic for real data
      const { data, error } = await supabase.from("buyers").select("*").eq("id", buyerId).single()

      if (!ignore) {
        if (error) {
          console.error(error)
        } else if (data) {
          setForm(data)
          setOldData(data)
        }
        setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [buyerId])

  function update<K extends keyof Buyer>(key: K, value: Buyer[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form) return

    if (buyerId === "demo-buyer-123") {
      // For demo, just show success message without actual save
      toast.success("Buyer info updated", {
        icon: <Check className="h-4 w-4 text-green-600" />,
      })

      if (onCancel) onCancel()
      else router.back()
      return
    }

    // Original save logic for real data
    const diff: Partial<Record<keyof Buyer, { old?: unknown; new?: unknown }>> = {}
    Object.keys(form).forEach((key) => {
      const k = key as keyof Buyer
      if (form[k] !== oldData[k]) {
        diff[k] = { old: oldData[k], new: form[k] }
      }
    })

    const { error: updateError } = await supabase.from("buyers").update(form).eq("id", buyerId)

    if (updateError) {
      console.error(updateError)
      toast.error("Failed to save changes")
      return
    }

    if (Object.keys(diff).length > 0) {
      const { error: historyError } = await supabase.from("buyer_history").insert({
        buyerid: buyerId,
        changedby: form.ownerid,
        diff: diff,
      })
      if (historyError) console.error("Failed to insert history:", historyError)
    }

    toast.success("Buyer info updated", {
      icon: <Check className="h-4 w-4 text-green-600" />,
    })

    if (onCancel) onCancel()
    else router.back()
  }

  function handleCancel() {
    if (onCancel) onCancel()
    else router.back()
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-lg">Loading buyer information...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Buyer Profile</h1>
        <p className="text-muted-foreground">Update buyer information and preferences</p>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="fullname"
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={form.fullname ?? ""}
              onChange={(e) => update("fullname", e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              type="email"
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              type="tel"
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              City
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.city ?? "Select city"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map((c) => (
                  <DropdownMenuItem key={c} onClick={() => update("city", c as Buyer["city"])}>
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Property Preferences Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Home className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Property Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              Property Type
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.propertytype ?? "Select type"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["Apartment", "Villa", "Plot", "Office", "Retail"].map((t) => (
                  <DropdownMenuItem key={t} onClick={() => update("propertytype", t as Buyer["propertytype"])}>
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              BHK Configuration
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.bhk ?? "Select BHK"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["1", "2", "3", "4", "Studio"].map((b) => (
                  <DropdownMenuItem key={b} onClick={() => update("bhk", b as Buyer["bhk"])}>
                    {b} {b !== "Studio" ? "BHK" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Purpose
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.purpose ?? "Select purpose"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["Buy", "Rent"].map((p) => (
                  <DropdownMenuItem key={p} onClick={() => update("purpose", p as Buyer["purpose"])}>
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Min Budget
            </Label>
            <Input
              type="number"
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={form.budgetmin ?? ""}
              onChange={(e) => update("budgetmin", Number(e.target.value))}
              placeholder="Min amount"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Max Budget
            </Label>
            <Input
              type="number"
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={form.budgetmax ?? ""}
              onChange={(e) => update("budgetmax", Number(e.target.value))}
              placeholder="Max amount"
            />
          </div>
        </div>
      </div>

      {/* Lead Management Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Lead Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Timeline
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.timeline ?? "Select timeline"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["0-3m", "3-6m", ">6m", "Exploring"].map((t) => (
                  <DropdownMenuItem key={t} onClick={() => update("timeline", t as Buyer["timeline"])}>
                    {t === "0-3m"
                      ? "0-3 months"
                      : t === "3-6m"
                        ? "3-6 months"
                        : t === ">6m"
                          ? "More than 6 months"
                          : "Just Exploring"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Lead Source
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  {form.source ?? "Select source"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["Website", "Referral", "Walk-in", "Call", "Other"].map((s) => (
                  <DropdownMenuItem key={s} onClick={() => update("source", s as Buyer["source"])}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Current Status
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background text-foreground hover:bg-accent transition-colors duration-200"
                >
                  <span className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        form.status === "New"
                          ? "bg-blue-500"
                          : form.status === "Qualified"
                            ? "bg-green-500"
                            : form.status === "Contacted"
                              ? "bg-yellow-500"
                              : form.status === "Visited"
                                ? "bg-purple-500"
                                : form.status === "Negotiation"
                                  ? "bg-orange-500"
                                  : form.status === "Converted"
                                    ? "bg-emerald-500"
                                    : form.status === "Dropped"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                      }`}
                    />
                    {form.status ?? "Select status"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"].map((s) => (
                  <DropdownMenuItem key={s} onClick={() => update("status", s as Buyer["status"])}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          s === "New"
                            ? "bg-blue-500"
                            : s === "Qualified"
                              ? "bg-green-500"
                              : s === "Contacted"
                                ? "bg-yellow-500"
                                : s === "Visited"
                                  ? "bg-purple-500"
                                  : s === "Negotiation"
                                    ? "bg-orange-500"
                                    : s === "Converted"
                                      ? "bg-emerald-500"
                                      : s === "Dropped"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                        }`}
                      />
                      {s}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Additional Notes Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Additional Notes</h2>
        </div>

        <Textarea
          className="w-full min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Add any additional notes or comments about this buyer..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2 px-6 py-2 transition-all duration-200 hover:bg-accent bg-transparent"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 transition-all duration-200 hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

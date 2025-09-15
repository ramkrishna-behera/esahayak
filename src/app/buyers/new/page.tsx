"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Mail,
  Phone,
  Tag,
} from "lucide-react";

export default function NewBuyer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    propertyType: "",
    bhk: "",
    purpose: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    source: "",
    notes: "",
    tags: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Utility to get logged-in user id or fallback
  const getUserId = () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      }
    } catch {
      // ignore parse errors
    }
    return "22222222-2222-2222-2222-222222222222";
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validate = () => {
    if (formData.fullName.trim().length < 2) return "Full name too short.";
    if (!/^\d{10,15}$/.test(formData.phone))
      return "Phone must be 10–15 digits.";
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
      return "Invalid email.";
    if (
      formData.budgetMin &&
      formData.budgetMax &&
      Number(formData.budgetMax) < Number(formData.budgetMin)
    )
      return "Budget Max must be ≥ Budget Min.";
    if (
      ["Apartment", "Villa"].includes(formData.propertyType) &&
      !formData.bhk
    )
      return "BHK required for Apartment/Villa.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const userId = getUserId();

      // Step 1: Insert into buyers
      const { data: buyer, error: buyerError } = await supabase
        .from("buyers")
        .insert([
          {
            fullname: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            propertytype: formData.propertyType,
            bhk: formData.bhk || null,
            purpose: formData.purpose,
            budgetmin: formData.budgetMin
              ? Number(formData.budgetMin)
              : null,
            budgetmax: formData.budgetMax
              ? Number(formData.budgetMax)
              : null,
            timeline: formData.timeline,
            source: formData.source,
            status: "New",
            notes: formData.notes,
            tags: formData.tags
              ? formData.tags.split(",").map((t) => t.trim())
              : [],
            ownerid: userId,
          },
        ])
        .select()
        .single();

      if (buyerError) throw buyerError;

      // Step 2: Insert into buyer_history
      const { error: historyError } = await supabase
        .from("buyer_history")
        .insert([
          {
            buyerid: buyer.id,
            changedby: userId,
            diff: {
              Create: { new: "Exists", old: "Didn't existed" },
            },
          },
        ]);

      if (historyError) throw historyError;

      router.push(`/buyers/${buyer.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Lead</h1>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter full name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="9876543210"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium">City</label>
          <select
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="">Select</option>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium">Property Type</label>
          <select
            value={formData.propertyType}
            onChange={(e) =>
              handleChange("propertyType", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="">Select</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </div>

        {/* BHK (conditional) */}
        {["Apartment", "Villa"].includes(formData.propertyType) && (
          <div>
            <label className="block text-sm font-medium">BHK</label>
            <select
              value={formData.bhk}
              onChange={(e) => handleChange("bhk", e.target.value)}
              className="px-3 py-2 border rounded-md w-full"
            >
              <option value="">Select</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>Studio</option>
            </select>
          </div>
        )}

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium">Purpose</label>
          <select
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="">Select</option>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Budget Min</label>
            <Input
              type="number"
              value={formData.budgetMin}
              onChange={(e) => handleChange("budgetMin", e.target.value)}
              placeholder="500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Budget Max</label>
            <Input
              type="number"
              value={formData.budgetMax}
              onChange={(e) => handleChange("budgetMax", e.target.value)}
              placeholder="2000000"
            />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium">Timeline</label>
          <select
            value={formData.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="">Select</option>
            <option>0-3m</option>
            <option>3-6m</option>
            <option>&gt;6m</option>
            <option>Exploring</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium">Source</label>
          <select
            value={formData.source}
            onChange={(e) => handleChange("source", e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="">Select</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Walk-in</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Enter notes"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <Input
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="VIP, NRI"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 mt-4 text-sm font-medium">{error}</p>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Create Lead"}
        </Button>
      </div>
    </div>
  );
}

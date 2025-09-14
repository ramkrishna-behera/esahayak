"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, Check } from "lucide-react";
import Papa from "papaparse";

type BuyerRow = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  notes?: string;
  tags?: string;
  status: string;
};

type RowError = {
  row: number;
  message: string;
};

const validCities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const validPropertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"];
const validBHK = ["1", "2", "3", "4", "Studio"];
const validPurpose = ["Buy", "Rent"];
const validTimeline = ["0-3m", "3-6m", ">6m", "Exploring"];
const validSource = ["Website", "Referral", "Walk-in", "Call", "Other"];
const validStatus = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessCount(null);
    }
  };

  const validateRow = (row: BuyerRow, index: number): RowError | null => {
    if (!row.fullName || row.fullName.trim().length < 2)
      return { row: index + 2, message: "Full name must be ≥ 2 chars" };

    if (!/^\d{10,15}$/.test(row.phone))
      return { row: index + 2, message: "Phone must be 10–15 digits" };

    if (row.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email))
      return { row: index + 2, message: "Invalid email" };

    if (!validCities.includes(row.city))
      return { row: index + 2, message: `Invalid city: ${row.city}` };

    if (!validPropertyTypes.includes(row.propertyType))
      return {
        row: index + 2,
        message: `Invalid property type: ${row.propertyType}`,
      };

    if (["Apartment", "Villa"].includes(row.propertyType) && !row.bhk)
      return { row: index + 2, message: "BHK required for Apartment/Villa" };

    if (row.bhk && !validBHK.includes(row.bhk))
      return { row: index + 2, message: `Invalid BHK: ${row.bhk}` };

    if (!validPurpose.includes(row.purpose))
      return { row: index + 2, message: `Invalid purpose: ${row.purpose}` };

    if (!validTimeline.includes(row.timeline))
      return { row: index + 2, message: `Invalid timeline: ${row.timeline}` };

    if (!validSource.includes(row.source))
      return { row: index + 2, message: `Invalid source: ${row.source}` };

    if (!validStatus.includes(row.status))
      return { row: index + 2, message: `Invalid status: ${row.status}` };

    const min = row.budgetMin ? Number(row.budgetMin) : undefined;
    const max = row.budgetMax ? Number(row.budgetMax) : undefined;

    if (min && max && max < min)
      return { row: index + 2, message: "Budget Max must be ≥ Budget Min" };

    return null;
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    setErrors([]);
    setSuccessCount(null);

    Papa.parse<BuyerRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<BuyerRow>) => {
        if (results.data.length > 200) {
          setErrors([{ row: 0, message: "CSV exceeds 200 rows" }]);
          setLoading(false);
          return;
        }

        const rowErrors: RowError[] = [];
        const validRows: BuyerRow[] = [];

        results.data.forEach((row, idx) => {
          const err = validateRow(row, idx);
          if (err) rowErrors.push(err);
          else validRows.push(row);
        });

        if (rowErrors.length > 0) {
          setErrors(rowErrors);
          setLoading(false);
          return;
        }

        // Insert valid rows
        try {
          let success = 0;
          for (const row of validRows) {
            // Insert buyer first
            const { data: buyer, error: buyerError } = await supabase
              .from("buyers")
              .insert([
                {
                  fullname: row.fullName,
                  email: row.email,
                  phone: row.phone,
                  city: row.city,
                  propertytype: row.propertyType,
                  bhk: row.bhk || null,
                  purpose: row.purpose,
                  budgetmin: row.budgetMin ? Number(row.budgetMin) : null,
                  budgetmax: row.budgetMax ? Number(row.budgetMax) : null,
                  timeline: row.timeline,
                  source: row.source,
                  status: row.status,
                  notes: row.notes || null,
                  tags: row.tags
                    ? row.tags.split(",").map((t) => t.trim())
                    : [],
                  ownerid: "11111111-1111-1111-1111-111111111111",
                },
              ])
              .select()
              .single();

            if (buyerError || !buyer) throw buyerError;

            // Insert buyer_history
            const { error: historyError } = await supabase
              .from("buyer_history")
              .insert([
                {
                  buyerid: buyer.id,
                  changedby: "11111111-1111-1111-1111-111111111111",
                  diff: { Create: { new: "Exists", old: "Didn't existed" } },
                },
              ]);

            if (historyError) throw historyError;
            success++;
          }
          setSuccessCount(success);
        } catch (err: any) {
          setErrors([{ row: 0, message: err.message }]);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bulk Upload Leads</h1>

<div className="mb-6 p-4 border rounded-md bg-muted/30 text-sm leading-relaxed space-y-2">
  <p className="font-semibold">📌 CSV Upload Instructions:</p>
  <ul className="list-disc pl-6 space-y-1">
    <li>
      Maximum <strong>200 rows</strong>.
    </li>
    <li>
      CSV must include these headers (case-sensitive):
      <br />
      <code>
        fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
      </code>
    </li>
    <li>
      <strong>fullName</strong>: at least 2 characters
    </li>
    <li>
      <strong>phone</strong>: numeric, 10–15 digits
    </li>
    <li>
      <strong>email</strong>: must be valid if provided
    </li>
    <li>
      <strong>city</strong>: one of
      <code>[Chandigarh, Mohali, Zirakpur, Panchkula, Other]</code>
    </li>
    <li>
      <strong>propertyType</strong>: one of
      <code>[Apartment, Villa, Plot, Office, Retail]</code>
    </li>
    <li>
      <strong>bhk</strong>: required if propertyType =
      <code>Apartment</code> or <code>Villa</code>; allowed values:
      <code>[1, 2, 3, 4, Studio]</code>
    </li>
    <li>
      <strong>purpose</strong>: one of <code>[Buy, Rent]</code>
    </li>
    <li>
      <strong>budgetMin</strong> &amp; <strong>budgetMax</strong>: numbers,
      and <code>budgetMax ≥ budgetMin</code>
    </li>
    <li>
      <strong>timeline</strong>: one of
      <code>[0-3m, 3-6m, &gt;6m, Exploring]</code>
    </li>
    <li>
      <strong>source</strong>: one of
      <code>[Website, Referral, Walk-in, Call, Other]</code>
    </li>
    <li>
      <strong>status</strong>: one of
      <code>[New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped]</code>
    </li>
    <li>
      <strong>notes</strong>: optional free text
    </li>
    <li>
      <strong>tags</strong>: optional, comma-separated (e.g.
      <code>"VIP, NRI"</code>)
    </li>
  </ul>
</div>


      <div className="flex items-center gap-4 mb-4">
        <Input type="file" accept=".csv" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={loading || !file}>
          {loading ? "Uploading..." : <Upload className="w-4 h-4 mr-2 inline" />}
          Upload
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Errors</h2>
          <ScrollArea className="h-64 border rounded-md p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{err.row}</TableCell>
                    <TableCell>{err.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {successCount !== null && (
        <div className="mt-4 text-green-600 flex items-center gap-2">
          <Check className="w-5 h-5" /> {successCount} rows uploaded successfully!
        </div>
      )}
    </div>
  );
}

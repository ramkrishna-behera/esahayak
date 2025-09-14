"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ImportExportPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background">
      <h1 className="text-2xl font-bold">Import & Export</h1>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/import-export/import")}>
          Import
        </Button>
        <Button onClick={() => router.push("/import-export/export")}>
          Export
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
        Go to Dashboard
      </Button>
    </div>
  );
}

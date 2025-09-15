// components/AuthGuard.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [countdown, setCountdown] = useState(7)

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval)
            router.push("/login")
          }
          return c - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 border rounded-lg bg-card shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
          <p className="text-sm text-muted-foreground">
            Only logged-in users can access this page. Redirecting to login in {countdown}s...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
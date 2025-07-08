"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * The root page of the application.
 * Its sole purpose is to redirect the user to the main `/upload` page.
 */
export default function OtoAppPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/upload")
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 justify-center items-center">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      {/* <p>Redirecting...</p> */}
    </div>
  )
}

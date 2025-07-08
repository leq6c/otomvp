import type { ReactNode } from "react"

type ContentGridProps = {
  left: ReactNode
  main: ReactNode
  right: ReactNode
}

/**
 * A reusable 3-column grid layout for the main content area of pages.
 */
export default function ContentGrid({ left, main, right }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 bg-white p-10 rounded-2xl">
      <div className="md:col-span-1">{left}</div>
      <div className="md:col-span-2 min-h-[480px]">{main}</div>
      <div className="md:col-span-1">{right}</div>
    </div>
  )
}

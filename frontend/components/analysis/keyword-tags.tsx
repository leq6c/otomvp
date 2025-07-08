import type { Keyword } from "@/types"
import { cn } from "@/lib/utils"

export default function KeywordTags({ keywords }: { keywords: Keyword[] }) {
  if (!keywords?.length) {
    return <p className="text-sm text-neutral-500 italic">No keywords identified.</p>
  }

  const tagStyle = (w: number) => {
    w *= 4
    const opacity = 0.5 + ((w - 1) / 3) * 0.6
    const scale = 0.875 + ((w - 1) / 3) * 0.25
    return { opacity, fontSize: `${scale}rem` }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((k) => (
        <span
          key={k.id}
          className={cn(
            "rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 transition-colors",
          )}
          style={tagStyle(k.weight)}
          title={`Keyword weight: ${k.weight}`}
        >
          {k.text}
        </span>
      ))}
    </div>
  )
}

import { MessageSquareText } from "lucide-react"

export default function AiSummary({ summary }: { summary?: string }) {
  if (!summary) return null

  return (
    <section className="mb-10">
      <h2 className="flex items-center text-xl font-semibold text-neutral-800 mb-3">
        <MessageSquareText className="w-5 h-5 mr-2.5 text-neutral-500" />
        Summary
      </h2>
      <blockquote className="pl-4 border-l-4 border-neutral-200 text-neutral-700 text-sm italic leading-relaxed">
        {summary}
      </blockquote>
    </section>
  )
}

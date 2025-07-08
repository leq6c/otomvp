import OtoHeader from "@/components/layout/oto-header"
import Link from "next/link"
import OtoFooter from "@/components/layout/oto-footer"

const pageContent = {
  title: "oto - Voice Yields",
  updateNotice: {
    text: "Turning the world's conversations into data",
    linkText: "",
    linkHref: "/whats-oto",
  },
  sections: [
    {
      heading: "",
      paragraphs: [
        "There is almost no data of real-life conversations on the internet. This means speech-AI training data is drastically scarcer than text—something we have verified empirically. oto is a project that pairs a wearable voice-capture device with a smartphone app to turn daily conversations around the world into structured data. For speakers of major languages, oto unlocks personalized services—automatic task management, meeting notes, health insights. For under-represented languages and heavy accents, users can monetize their uploads by licensing data to AI firms. These incentives let us map global conversation flow, creating a speech-based Google Trends or Maps.",
        "Voice AI systems are still unable to engage in human-level natural conversation. All of these limitations stem from a fundamental lack of high-quality, diverse training data. One notable initiative is Mozilla Common Voice, which treats voice as a public good. However, it still falls short in terms of dataset volume and diversity. We aim to address this problem by building on the public-good model and introducing DePIN-style token incentives to accelerate the creation and sharing of diverse, real-world voice data at scale.",
      ],
    },
  ],
  footer: { signature: "oto Team", date: "June 25, 2025", contactText: "Contact Us", contactHref: "/whats-oto" },
}

export default function WhatsOtoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white p-10 rounded-2xl">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">{pageContent.title}</h1>
            <p className="text-sm text-neutral-600 mb-8">
              {pageContent.updateNotice.text}{" "}
              <Link href={pageContent.updateNotice.linkHref} className="text-blue-600 hover:underline">
                {pageContent.updateNotice.linkText}
              </Link>
            </p>
            <div className="space-y-6 text-neutral-700 leading-relaxed">
              {pageContent.sections.map((section, index) => (
                <div key={index}>
                  {section.heading && (
                    <p>
                      <strong className="font-semibold text-neutral-800">{section.heading}</strong>
                    </p>
                  )}
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace("oto.", '<strong class="font-semibold text-neutral-800">oto</strong>.')
                          .replace(
                            "It's called oto.",
                            'It\'s called <strong class="font-semibold text-neutral-800">oto</strong>.',
                          ),
                      }}
                    />
                  ))}
                </div>
              ))}
              <p className="mt-8 text-sm">{pageContent.footer.signature}</p>
              <p className="text-xs text-neutral-500">{pageContent.footer.date}</p>
              <p className="mt-8">
                <Link href={pageContent.footer.contactHref} className="text-blue-600 hover:underline font-medium">
                  {pageContent.footer.contactText}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <OtoFooter />
    </div>
  )
}

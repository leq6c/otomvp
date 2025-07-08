import OtoHeader from "@/components/layout/oto-header"
import OtoFooter from "@/components/layout/oto-footer"
import ContentGrid from "@/components/layout/content-grid"
import { SkeletonUploadedFiles, SkeletonProfileDetails, SkeletonEarnings } from "@/components/shared/skeletons"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <ContentGrid left={<SkeletonUploadedFiles />} main={<SkeletonProfileDetails />} right={<SkeletonEarnings />} />
      </main>
      <OtoFooter />
    </div>
  )
}

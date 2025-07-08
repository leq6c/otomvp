import { useUploadedFiles } from "@/app/contexts/uploaded_files_context";
import { usePrivy } from "@privy-io/react-auth";

export default function EarningsPanel() {
  const { authenticated } = usePrivy();
  const { points } = useUploadedFiles();

  if (!authenticated) {
    return (
      <div className="text-right">
        <h2 className="text-lg font-semibold mb-1 text-neutral-800">Earning</h2>
        <p className="text-4xl font-semibold text-neutral-900">
        ... <span className="text-2xl">points</span>
        </p>
      </div>
    )
  }

  return (
    <div className="text-right">
      <h2 className="text-lg font-semibold mb-1 text-neutral-800">Earning</h2>
      {points !== null ? (
      <p className="text-4xl font-semibold text-neutral-900">
        {points?.toLocaleString()} <span className="text-2xl">points</span>
      </p>
      ) : (
        <p className="text-4xl font-semibold text-neutral-900">
        ... <span className="text-2xl">points</span>
        </p>
      )}
    </div>
  )
}

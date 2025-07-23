import { useUploadedFiles } from "@/app/contexts/uploaded_files_context";
import { usePrivy } from "@privy-io/react-auth";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";
import { useEffect } from "react";
import { useOtoProgram } from "@/hooks/useOtoProgram";
import { useClaim } from "@/hooks/use-api";
import { ClaimableAmountResponse, ClaimResponse } from "@/lib/api-service";
import { Toaster, toast } from "sonner"

export default function EarningsPanel() {
  const { authenticated } = usePrivy();
  const { points } = useUploadedFiles();
  const { claimTokens, signTransaction } = useOtoProgram();
  const { claim, getClaimableAmount, loading, error } = useClaim();

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

  const handleClaim = async () => {
    if (!claimTokens) return;
    const claimableAmount: ClaimableAmountResponse = await getClaimableAmount() as any;
    if (claimableAmount.amount === 0) return;

    // start loading toast
    const loader = toast.loading("Claiming...", {
      description: "Please wait while we claim your earnings",
    })

    const tx = await claimTokens(claimableAmount.amount);
    if (!tx) return;
    try {
      const signedTx = await signTransaction(tx);
      const base64Tx = Buffer.from(signedTx?.serialize({
        "requireAllSignatures": false,
        "verifySignatures": false,
      })!).toString("base64");

      const response: ClaimResponse = await claim(base64Tx) as any;

      toast.success("Claimed earnings", {
        description: "Your earnings have been claimed successfully\n" + response.signature,
        duration: 10000,
      })

      await getClaimableAmount();
    } catch (error) {
      toast.error("Failed to claim earnings", {
        description: "Failed to claim earnings",
      })
    } finally {
      toast.dismiss(loader);
    }
  };

  return (
    <div className="text-right">
      <Toaster />
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
      {points !== null && points > 0 && <button
      className="bg-neutral-900 text-sm text-white px-2 py-1 rounded-lg mt-2"
      onClick={handleClaim}
      >Claim</button>
      }

      {points === 0 && <button
      className="bg-neutral-900 text-sm text-white px-2 py-1 rounded-lg mt-2 opacity-50"
      disabled
      >Claim</button>}
    </div>
  )
}

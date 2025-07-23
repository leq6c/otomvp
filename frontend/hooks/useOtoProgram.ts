"use client";

import { BN, Program } from "@coral-xyz/anchor";
import { useAnchorProvider } from "./useAnchorProvider";
import { Oto } from "@/contracts/oto";
import otoIdl from "@/contracts/oto.json";
import { useMemo } from "react";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";

const ADMIN_PUBLIC_KEY = "8T4je6ro8VbfRvhUJqrpYPrce6aVKoFB75EyJ68eTf3o";

export const useOtoProgram = () => {
  const { provider } = useAnchorProvider();
  const { user } = usePrivy();

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<Oto>(otoIdl as any, provider);
  }, [provider]);

  const claimTokens = async (amount: number) => {
    if (!provider) return null;
    const tx = program?.methods.mintOto(new BN(amount)).accounts({
      beneficiary: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      payer: new PublicKey(ADMIN_PUBLIC_KEY),
    });
    const prepared = await tx?.prepare();
    const rawTx = new Transaction().add(prepared!.instruction);
    rawTx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    rawTx.feePayer = new PublicKey(ADMIN_PUBLIC_KEY);

    return rawTx;
  };

  const signTransaction = async (tx: Transaction) => {
    if (!provider) return null;
    return await provider.wallet.signTransaction(tx);
  };

  return {
    program,
    claimTokens,
    signTransaction,
  };
};

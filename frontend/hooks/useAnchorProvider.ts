"use client";

import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  ConnectedSolanaWallet,
  useSolanaWallets,
  useSignTransaction,
  useSendTransaction,
} from "@privy-io/react-auth/solana";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export function useAnchorProvider() {
  const { wallets } = useSolanaWallets();
  const { signTransaction } = useSignTransaction();
  const { sendTransaction } = useSendTransaction();

  if (!wallets || wallets.length === 0) {
    return { provider: null };
  }

  const wallet: ConnectedSolanaWallet = wallets[0];

  const connection = new Connection(SOLANA_RPC_URL);

  const walletProvider: Wallet = {
    publicKey: new PublicKey(wallet.address),
    signTransaction: async (tx) => {
      const signedTx = await signTransaction({
        transaction: tx,
        connection: connection,
      });
      return signedTx as any;
    },
    signAllTransactions: async (txs) => {
      throw new Error("Not implemented");
    },
    payer: null as any,
  };

  const provider = new AnchorProvider(connection, walletProvider, {
    commitment: "confirmed",
  });

  return { provider };
}

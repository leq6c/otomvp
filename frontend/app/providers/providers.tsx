'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { PeriodicallyUpdatedUploadedFiles } from '../contexts/uploaded_files_context';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId="cmcc0wydx0086js0l5e5gj35e"
      clientId="client-WY6N2jYhjSc3MBZXJinPQz9XWMUCQsJie5MPqjhmHi2mr"
      config={{
        appearance: {
            walletChainType:"ethereum-only",
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        },
      }}
    >
        <PeriodicallyUpdatedUploadedFiles>
      {children}
        </PeriodicallyUpdatedUploadedFiles>
    </PrivyProvider>
  );
}
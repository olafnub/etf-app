// Code from https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md
// SolanaProvider from https://solana.com/developers/cookbook/wallets/connect-wallet-react
// Layout from wallet-ui
'use client';
import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { 
    WalletModalProvider,
    WalletDisconnectButton
 } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

// https://solana.stackexchange.com/questions/4304/error-hydration-failed-because-the-initial-ui-does-not-match-what-was-rendered
// const WalletMultiButtonDynamic = dynamic(
//     async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
//     { ssr: false }
// );


export function SolanaProvider( {children}: {children: ReactNode}) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

// future https://github.com/anza-xyz/kit/blob/main/examples/react-app/src/components/WalletAccountIcon.tsx
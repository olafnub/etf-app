// Code from https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md
// SolanaProvider from https://solana.com/developers/cookbook/wallets/connect-wallet-react
// Layout from wallet-ui
'use client';
import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { 
    WalletModalProvider,
    WalletMultiButton,
    WalletDisconnectButton
 } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { clusterApi } from '@solana/kits';

import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProvider( {children}: {children: ReactNode}) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // const endpoint = useMemo(() => clusterApi(network, [network]));
    const endpoint = "https://api.devnet.solana.com";

    const wallets = useMemo(
        () => [
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    )

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )

}
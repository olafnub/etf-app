// https://solana.stackexchange.com/questions/4304/error-hydration-failed-because-the-initial-ui-does-not-match-what-was-rendered

'use client';
import dynamic from 'next/dynamic';
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export function ConnectWallet() {
  return (
    <>
        <WalletMultiButtonDynamic /> 
    </>
  )
}

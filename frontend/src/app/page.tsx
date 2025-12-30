import { JupiterSwap } from '@/components/jupiter-swap';
import { BalanceUI } from '@/components/balance-ui';

export default function Home() {
  return (
    <div className="flex">
      <BalanceUI />
      <JupiterSwap />
    </div>
  );
}

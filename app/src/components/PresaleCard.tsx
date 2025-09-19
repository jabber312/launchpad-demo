"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { PRESALE_ABI } from "@/lib/abis";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const PRESALE = process.env
  .NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}` | undefined;

function StatusBadge({ s }: { s: number | undefined }) {
  const map = ["NotStarted", "Live", "Ended", "Finalized", "RefundsEnabled"];
  return (
    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
      {s === undefined ? "…" : map[s] ?? "Unknown"}
    </span>
  );
}

export default function PresaleCard() {
  // call hooks unconditionally (keeps order stable across renders)
  const { address } = useAccount();
  const [amt, setAmt] = useState("0.02");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: statusRaw } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "status",
  });

  const { data: raisedRaw } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "totalRaised",
  });

  const { data: cfg } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "config",
  });
  // cfg indices: 0 start, 1 end, 2 softCap, 3 hardCap, 4 minBuy, 5 maxBuy, 6 rate, 7 treasury, 8 tgeBps, 9 vestingDuration

  const { data: myContribRaw } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "contributions",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });

  const { data: canClaimRaw } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "claimable",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });

  const { data: canRefundRaw } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE,
    functionName: "refundable",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  // cast unknowns → expected types
  const status = statusRaw as number | undefined;
  const raised = raisedRaw as bigint | undefined;
  const myContrib = myContribRaw as bigint | undefined;
  const canClaim = canClaimRaw as bigint | undefined;
  const canRefund = canRefundRaw as bigint | undefined;

  const hardCap: bigint | undefined = cfg ? ((cfg as any)[3] as bigint) : undefined;
  const softCap: bigint | undefined = cfg ? ((cfg as any)[2] as bigint) : undefined;

  // progress as number (avoid bigint literals)
  const progressPct =
    raised && hardCap && Number(hardCap) > 0
      ? Math.min(100, Math.floor((Number(raised) / Number(hardCap)) * 100))
      : 0;

  // stable disabled flags to avoid hydration mismatch
  const hasWallet = mounted && !!address;
  const isContributeDisabled = !hasWallet || txLoading || !PRESALE;
  const isClaimDisabled = !hasWallet || !canClaim || Number(canClaim) <= 0;
  const isRefundDisabled = !hasWallet || !canRefund || Number(canRefund) <= 0;

  // helper formatter
  const fmt = (v?: bigint) =>
    typeof v === "bigint" ? Number(formatEther(v)).toFixed(4) : "…";

  // show a tiny placeholder until mounted (no early return before hooks)
  if (!mounted) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl shadow-sm border bg-white">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-2 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!PRESALE) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl shadow-sm border bg-white">
        <p className="text-red-600">
          NEXT_PUBLIC_PRESALE_ADDRESS is missing in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 rounded-2xl shadow-sm border bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Launchpad Presale</h2>
        <StatusBadge s={status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>Raised: <b>{fmt(raised)} ETH</b></div>
        <div>Soft cap: {fmt(softCap)} ETH</div>
        <div>Hard cap: {fmt(hardCap)} ETH</div>
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div
            className="h-2 bg-gray-800 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Your contribution: <b>{fmt(myContrib)} ETH</b></div>
        <ConnectButton />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Contribute amount (ETH)</label>
        <input
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          className="w-full border rounded-xl px-3 py-2"
          placeholder="0.02"
          inputMode="decimal"
        />
        <button
          onClick={() =>
            writeContract({
              abi: PRESALE_ABI,
              address: PRESALE,
              functionName: "contribute",
              value: parseEther(amt || "0"),
            })
          }
          disabled={isContributeDisabled}
          className="w-full py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {txLoading ? "Pending…" : "Contribute"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            writeContract({
              abi: PRESALE_ABI,
              address: PRESALE,
              functionName: "claimTokens",
            })
          }
          disabled={isClaimDisabled}
          className="py-2 rounded-xl border"
        >
          Claim {canClaim ? Number(formatEther(canClaim)).toFixed(4) : 0} tokens
        </button>

        <button
          onClick={() =>
            writeContract({
              abi: PRESALE_ABI,
              address: PRESALE,
              functionName: "refund",
            })
          }
          disabled={isRefundDisabled}
          className="py-2 rounded-xl border"
        >
          Refund
        </button>
      </div>

      {txSuccess && (
        <div className="text-green-700 text-sm">Tx confirmed ✓</div>
      )}
    </div>
  );
}

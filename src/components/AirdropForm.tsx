"use client";

import InputField from "@/components/ui/InputField";
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { calculateTotal } from "@/utils";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useMemo, useState } from "react";
import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [isApproving, setIsApproving] = useState(false);

  const getApprovedAmount = async (
    tSenderAddress: string | null
  ): Promise<number> => {
    if (!tSenderAddress) {
      alert("No address found, please use a supported chain");
      return 0;
    }

    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });
    return response as number;
  };

  const handleSubmit = async () => {
    try {
      const tSenderAddress = chainsToTSender[chainId]["tsender"];
      const approvedAmount = await getApprovedAmount(tSenderAddress);

      if (approvedAmount < total) {
        setIsApproving(true);
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        });
        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash,
        });
        setIsApproving(false);
      }
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div>
      <InputField
        label="Token Address"
        placeholder="0x"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <InputField
        label="Recipients"
        placeholder="0x1234,0x23456,0x566"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        large={true}
      />
      <InputField
        label="Amount"
        placeholder="100,200,300"
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
        large={true}
      />
      <button
        onClick={handleSubmit}
        disabled={isPending || isApproving}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed w-full flex items-center justify-center"
      >
        {isPending || isApproving ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
            {isApproving ? "Approving..." : "Sending..."}
          </>
        ) : (
          "Send Tokens"
        )}
      </button>
    </div>
  );
}

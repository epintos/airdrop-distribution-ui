"use client";

import InputField from "@/components/ui/InputField";
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { calculateTotal } from "@/utils";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const {
    data: hash,
    isPending,
    error,
    writeContractAsync,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
  } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
  });
  const { data: tokenData } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "balanceOf",
        args: [account.address],
      },
    ],
  });
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const isFormIncomplete = !tokenAddress || !recipients || !amounts;

  useEffect(() => {
    const savedTokenAddress = localStorage.getItem("tokenAddress");
    const savedRecipients = localStorage.getItem("recipients");
    const savedAmounts = localStorage.getItem("amounts");

    if (savedTokenAddress) setTokenAddress(savedTokenAddress);
    if (savedRecipients) setRecipients(savedRecipients);
    if (savedAmounts) setAmounts(savedAmounts);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("tokenAddress", tokenAddress);
  }, [tokenAddress]);

  useEffect(() => {
    localStorage.setItem("recipients", recipients);
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem("amounts", amounts);
  }, [amounts]);

  useEffect(() => {
    const userBalance = tokenData?.[2].result as number;
    if (tokenAddress && total > 0 && userBalance !== undefined) {
        setInsufficientBalance(userBalance < total);
    } else {
      setInsufficientBalance(false);
    }
}, [tokenAddress, total, tokenData]);


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

  const getBalance = async (tSenderAddress: string | null): Promise<number> => {
    if (!tSenderAddress) {
      alert("No address found, please use a supported chain");
      return 0;
    }
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "balanceOf",
      args: [account.address],
    });
    return response as number;
  };

  const handleSubmit = async () => {
    try {
      const tSenderAddress = chainsToTSender[chainId]["tsender"];
      const approvedAmount = await getApprovedAmount(tSenderAddress);

      if (approvedAmount < total) {
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        });
        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash,
        });
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

  function getButtonContent() {
    if (isPending)
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <CgSpinner className="animate-spin" size={20} />
          <span>Confirming in wallet...</span>
        </div>
      );
    if (isConfirming)
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <CgSpinner className="animate-spin" size={20} />
          <span>Waiting for transaction to be included...</span>
        </div>
      );
    if (error || isError) {
      console.log(error);
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <span>Error, see console.</span>
        </div>
      );
    }
    if (isConfirmed) {
      return "Transaction confirmed.";
    }
  }

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
        disabled={isPending || isConfirming || isError || insufficientBalance || isFormIncomplete}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed w-full flex items-center justify-center"
      >
        {isPending || error || isError || isConfirming
          ? getButtonContent()
          : insufficientBalance && tokenAddress
          ? "Insufficient token balance"
          : "Send Tokens"}
      </button>
    </div>
  );
}

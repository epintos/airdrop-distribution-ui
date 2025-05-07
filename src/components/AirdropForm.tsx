"use client";

import InputField from "@/components/ui/InputField";
import { useState } from "react";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress ] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");

  const handleSubmit = async () => {
    console.log("tokenAddress", tokenAddress);
    console.log("recipients", recipients);
    console.log("amounts", amounts);
  };

  return(
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
      <button onClick={handleSubmit}>
        Send tokens
      </button>
    </div>
  )
}

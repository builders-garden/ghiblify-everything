import { type Address,encodeFunctionData } from "viem";

import { NFT_ABI } from "./abi";

export const getMintTxCalldata = (
    address: Address,
    id: bigint,
) => {

  return encodeFunctionData({
    abi: NFT_ABI,
    functionName: "mint",
    args: [
      address,
      id,
    ],
  });
};

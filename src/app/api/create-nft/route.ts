import { type NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { z } from "zod";

import { NFT_ABI } from "@/lib/abi";
import { NFT_CONTRACT_ADDRESS, NFT_PRICE } from "@/lib/constant";
import { CreateNftResponse } from "@/types/create-nft-response";

const inputCreateNftSchema = z.object({
  id: z.string(),
  uri: z.string(),
  address: z.string(),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateNftResponse>> {
  try {
    const { success, data: parsedData } = inputCreateNftSchema.safeParse(
      await request.json()
    );
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Invalid create nft arguments" },
        { status: 400 }
      );
    }

    const { id, uri, address } = parsedData;
    console.log("Received data:", parsedData);

    // Get private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: "Private key not configured" },
        { status: 500 }
      );
    }

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Send transaction
    const hash = await client.writeContract({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: NFT_ABI,
      functionName: "create",
      args: [BigInt(NFT_PRICE), uri, BigInt(id), address as `0x${string}`],
    });

    await publicClient.waitForTransactionReceipt({
      hash,
    });

    return NextResponse.json(
      {
        success: true,
        transactionHash: hash,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

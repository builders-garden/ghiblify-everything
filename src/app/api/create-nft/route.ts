import { type NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { NFT_ABI } from "@/lib/abi";
import { NFT_CONTRACT_ADDRESS, NFT_PRICE } from "@/lib/constant";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { id, uri, address } = data;

    console.log("Received data:", data);

    if (!id || !uri || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key not configured" },
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

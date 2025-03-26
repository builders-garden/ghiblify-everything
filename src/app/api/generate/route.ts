import ky from "ky";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env.mjs";
import {
  CreateNftResponse,
  GenerateResponse,
  PinataResponse,
  ReplicateResponse,
  UploadResponse,
} from "@/types";

const inputGenerateSchema = z.object({
  user_pfp: z.string(),
  user_username: z.string(),
  user_fid: z.string(),
  user_address: z.string(),
});

export const POST = async (
  req: Request
): Promise<NextResponse<GenerateResponse>> => {
  const data = await req.json();
  const { success, data: parsedData } = inputGenerateSchema.safeParse(data);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Invalid generate arguments" },
      { status: 400 }
    );
  }

  // 1. generate image using replicate
  console.log("[1] Generating image using replicate");
  const genResponse = await ky
    .post<ReplicateResponse>("/api/replicate", {
      json: parsedData,
    })
    .json();
  const { output: imageBlob } = genResponse;
  if (!imageBlob || !genResponse.success) {
    return NextResponse.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 }
    );
  }
  console.log("[1] Image generated...");

  // 2. upload image to uploadthing and save to db
  console.log("[2] Uploading image to uploadthing and save to db");
  const uploadResponse = await ky
    .post<UploadResponse>("/api/upload/blob", {
      json: {
        generated_files: [
          new File([imageBlob], `generated-${parsedData.user_fid}.png`),
        ],
        user_fid: parsedData.user_fid,
        user_username: parsedData.user_username,
        user_pfp: parsedData.user_pfp,
      },
      headers: {
        "x-secure-upload": env.SECURE_UPLOAD_TOKEN,
      },
    })
    .json();
  console.log(
    "[2] Image uploaded to uploadthing with status:",
    uploadResponse.success
  );
  if (!uploadResponse.success || !uploadResponse.files) {
    console.error(uploadResponse.error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }

  const { files } = uploadResponse;
  const imageUrl = files[0].url;

  // 3. upload image to pinata
  console.log("[3] Uploading image to pinata");
  const pinataResponse = await ky
    .post<PinataResponse>("/api/pinata", {
      json: {
        title: `Ghibly ${parsedData.user_username}`,
        description: `Here's my ghibly ${parsedData.user_username}`,
        imageUrl: imageUrl,
      },
    })
    .json();
  console.log(
    "[3] Image uploaded to pinata with status:",
    pinataResponse.success
  );
  if (!pinataResponse.success || !pinataResponse.data) {
    console.error(pinataResponse.error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image to pinata" },
      { status: 500 }
    );
  }

  // 4. create nft
  console.log("[4] Creating nft");
  const createNftResponse = await ky
    .post<CreateNftResponse>("/api/create-nft", {
      json: {
        id: parsedData.user_fid,
        uri: pinataResponse.data.metadataUrl,
        address: parsedData.user_address,
      },
    })
    .json();
  console.log("[4] Nft created with status:", createNftResponse.success);
  if (!createNftResponse.success) {
    console.error(createNftResponse.error);
    return NextResponse.json(
      { success: false, error: "Failed to create nft" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    transactionHash: createNftResponse.transactionHash,
    imageUrl: imageUrl,
    pinataImageUrl: pinataResponse.data.imageUrl,
  });
};

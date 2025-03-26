import ky from "ky";
import { NextResponse } from "next/server";
import { z } from "zod";

import { saveFiles } from "@/db/queries";
import { env } from "@/lib/env.mjs";
import {
  CreateNftResponse,
  GenerateResponse,
  PinataResponse,
  ReplicateResponse,
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
    console.error("Invalid generate arguments:", data);
    return NextResponse.json(
      { success: false, error: "Invalid generate arguments" },
      { status: 400 }
    );
  }

  // 1. generate image using replicate
  console.log("[1] Generating image using replicate");
  const genResponse = await ky
    .post<ReplicateResponse>(`${env.NEXT_PUBLIC_URL}/api/replicate`, {
      json: {
        user_pfp: parsedData.user_pfp,
        user_username: parsedData.user_username,
        user_fid: parsedData.user_fid,
      },
    })
    .json();
  const { outputs: generatedImageUrls } = genResponse;
  if (!generatedImageUrls || !genResponse.success) {
    console.error("Failed to generate image:", genResponse);
    return NextResponse.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 }
    );
  }
  console.log("[1] Image generated...", generatedImageUrls);

  // TODO add uploadthing
  // 2. upload image to uploadthing and save to db
  // console.log("[2] Uploading image to uploadthing and save to db");
  // const uploadResponse = await ky
  //   .post<UploadResponse>(`${env.NEXT_PUBLIC_URL}/api/upload/blob`, {
  //     json: {
  //       generated_files: [
  //         new File([imageBlob], `generated-${parsedData.user_fid}.png`),
  //       ],
  //       user_fid: parsedData.user_fid,
  //       user_username: parsedData.user_username,
  //       user_pfp: parsedData.user_pfp,
  //     },
  //     headers: {
  //       "x-secure-upload": env.SECURE_UPLOAD_TOKEN,
  //     },
  //   })
  //   .json();
  // console.log(
  //   "[2] Image uploaded to uploadthing with status:",
  //   uploadResponse.success
  // );
  // if (!uploadResponse.success || !uploadResponse.files) {
  //   console.error(uploadResponse.error);
  //   return NextResponse.json(
  //     { success: false, error: "Failed to upload image" },
  //     { status: 500 }
  //   );
  // }

  // const { files } = uploadResponse;
  // const imageUrl = files[0].url;

  // 2. Save output images to db
  console.log("[2] Saving output images to db");
  const returnFiles = [];
  for (const url of generatedImageUrls) {
    returnFiles.push({
      url,
      name: `generated.${parsedData.user_fid}.png`,
      key: `generated.${parsedData.user_fid}.png`,
      uploadedBy: parsedData.user_fid,
    });
  }
  await saveFiles(returnFiles);
  console.log("[2] Image saved to db with status:", true);

  // 3. upload image to pinata
  console.log("[3] Uploading image to pinata");
  const pinataResponse = await ky
    .post<PinataResponse>(`${env.NEXT_PUBLIC_URL}/api/pinata`, {
      json: {
        title: `Ghibly ${parsedData.user_username}`,
        description: `Here's my ghibly ${parsedData.user_username}`,
        imageUrl: returnFiles[0].url,
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
    .post<CreateNftResponse>(`${env.NEXT_PUBLIC_URL}/api/create-nft`, {
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
    imageUrl: returnFiles[0].url,
    pinataImageUrl: pinataResponse.data.imageUrl,
  });
};

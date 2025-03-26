import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pinata } from "@/lib/pinata";
import { PinataResponse } from "@/types/pinata-response";

const inputPinataSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<PinataResponse>> {
  try {
    const { success, data: parsedData } = inputPinataSchema.safeParse(
      await request.json()
    );
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Invalid pinata arguments" },
        { status: 400 }
      );
    }

    //Upload metadata to Pinata
    const metadataFile = new File(
      [
        JSON.stringify({
          name: parsedData.title,
          description: parsedData.description,
          image: parsedData.imageUrl,
        }),
      ],
      "metadata.json",
      {
        type: "application/json",
      }
    );

    const metadataUploadData = await pinata.upload.file(metadataFile);
    const metadataCID = metadataUploadData.IpfsHash;
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl: parsedData.imageUrl,
          metadataUrl,
          metadataCID,
        },
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

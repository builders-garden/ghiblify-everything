import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await request.json();

      const title = data.title;
      const description = data.description;
      const imageUrl = data.imageUrl;

      //Upload metadata to Pinata
      const metadataFile = new File(
        [
          JSON.stringify({
            name: title,
            description: description,
            image: imageUrl,
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
          imageUrl,
          metadataUrl,
          metadataCID,
        },
        { status: 200 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

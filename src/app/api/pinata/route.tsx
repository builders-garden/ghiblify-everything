import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await request.json();

      const title = data.title;
      const description = data.description;
      const imageFile = data.imageFile;

      if (!title || !description || !imageFile) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Upload image file to Pinata
      const imageUploadData = await pinata.upload.file(imageFile);
      const imageCID = imageUploadData.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // Create metadata JSON
      const metadata = {
        name: title,
        image: imageUrl,
        description: description,
      };

      // Upload metadata
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      const metadataUploadData = await pinata.upload.file(metadataFile);
      const metadataCID = metadataUploadData.IpfsHash;
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

      return NextResponse.json(
        {
          imageUrl,
          metadataUrl,
          imageCID,
          metadataCID,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
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

import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await request.json();

      const title = data.title;
      const description = data.description;
      const base64Image = data.base64Image;

      if (!title || !description || !base64Image) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Convert base64 to Blob
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const binaryData = Buffer.from(base64Data, "base64");
      const imageBlob = new Blob([binaryData], { type: "image/png" });
      const imageFile = new File([imageBlob], "image.png", {
        type: "image/png",
      });

      // Upload image file to Pinata
      const imageUploadData = await pinata.upload.file(imageFile);
      const imageCID = imageUploadData.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // Send the Blob URLs to Pinata API
      const uploadResponse = await fetch("/api/pinata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "combined",
          imageFileUrl: imageUrl,
          title: title,
          description: description,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        return NextResponse.json(
          { error: errorData.error || "Error during upload process" },
          { status: 500 }
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload result:", JSON.stringify(uploadResult, null, 2));
      console.log("Metadata URL:", uploadResult.metadataUrl);

        return NextResponse.json(
          {
            imageUrl,
            imageCID,
            metadataUrl: uploadResult.metadataUrl,
            metadataCID: uploadResult.metadataCID,
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

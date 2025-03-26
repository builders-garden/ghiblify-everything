import { type NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

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
      const imageUploadData = await pinata.upload.public.file(imageFile);
      const imageCID = imageUploadData.cid;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
      console.log("Upload result:", JSON.stringify(imageUploadData, null, 2));

      //Upload metadata to Pinata
      const metadataFile = new File([JSON.stringify({
        name: title,
        description: description,
        image: imageUrl,
      })], "metadata.json", {
        type: "application/json",
      });

      const metadataUploadData = await pinata.upload.public.json(metadataFile);
      const metadataCID = metadataUploadData.cid;
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

        return NextResponse.json(
          {
            imageUrl,
            imageCID,
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

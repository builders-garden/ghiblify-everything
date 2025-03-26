import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

import { getOrCreateUser, saveFiles } from "@/db/queries";
import { env } from "@/lib/env.mjs";
import { UploadResponse } from "@/types";

const utapi = new UTApi({
  token: env.UPLOADTHING_TOKEN,
});

const inputUploadBlobSchema = z.object({
  generated_files: z.array(z.instanceof(File)),
  user_fid: z.string(),
  user_username: z.string(),
  user_pfp: z.string(),
});

export const POST = async (
  req: NextRequest
): Promise<NextResponse<UploadResponse>> => {
  try {
    // Check if the request is authorized
    const token = req.headers.get("x-secure-upload");
    if (token !== env.SECURE_UPLOAD_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await req.json();
    const { success, data: parsedData } = inputUploadBlobSchema.safeParse(data);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Invalid upload blob arguments" },
        { status: 400 }
      );
    }

    // Upload the file to UploadThing
    const uploadResponses = await utapi.uploadFiles(parsedData.generated_files);

    // Get or create the user
    const user = await getOrCreateUser(
      parsedData.user_fid,
      parsedData.user_username,
      parsedData.user_pfp
    );

    // Get the files from UploadThing response
    const returnFiles = [];
    for (const uploadRes of uploadResponses) {
      const file = uploadRes.data;
      if (!file) continue;
      // Persist the file data to your database
      returnFiles.push({
        key: file.key,
        name: file.name,
        url: file.ufsUrl,
        uploadedBy: user.fid,
      });
    }
    await saveFiles(returnFiles);

    // Revalidate the route that can be used for polling
    revalidateTag(`/api/files/${user.fid}`);

    return NextResponse.json({
      success: true,
      files: returnFiles,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Upload failed, unknown error",
      },
      { status: 500 }
    );
  }
};

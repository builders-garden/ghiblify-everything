import { NextRequest, NextResponse } from "next/server";

import { getFiles } from "@/db/queries";

/**
 * This route can be used for polling whether a file has been uploaded yet.
 * It will return a cached response until this route is revalidated by the
 * upload route (see `uploadRouter` in `api/uploadthing/core.ts`).
 */
export const revalidate = false;

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ fid: string }> }
) {
  const { fid } = await props.params;
  if (!fid) {
    return NextResponse.json(
      { success: false, error: "No fid" },
      { status: 400 }
    );
  }

  // get the files for the user from the database
  const files = await getFiles(fid);
  if (!files) {
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    files: files.map((file) => ({
      name: file.name,
      url: file.url,
      uploadedBy: file.uploadedBy,
    })),
  });
}

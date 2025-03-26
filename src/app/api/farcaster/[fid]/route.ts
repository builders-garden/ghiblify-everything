import { NextResponse } from "next/server";

import { fetchUser } from "@/lib/neynar";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      fid: string;
    }>;
  }
) {
  const { fid } = await params;

  if (isNaN(Number(fid))) {
    return new NextResponse("Invalid FID", { status: 400 });
  }

  try {
    const neynarUser = await fetchUser(fid);
    return NextResponse.json({
      status: "ok",
      data: {
        user: neynarUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({
        status: "error",
        message: error.message,
      });
    }

    return NextResponse.json({
      status: "error",
      message: "Unknown error occurred",
    });
  }
}

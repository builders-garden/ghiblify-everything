import { revalidateTag } from "next/cache";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { getOrCreateUser, saveFile } from "@/db/queries";
import { env } from "@/lib/env.mjs";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Error uploading file", err.message);
    console.log("  - Above error caused by:", err.cause);

    return { message: err.message };
  },
});

const auth = (req: Request) => {
  const token = req.headers.get("x-uploadthing-token");
  if (token !== env.UPLOADTHING_TOKEN) {
    return null;
  }
  return { authorized: true };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
      minFileCount: 1,
    },
  })
    .input(
      z.object({
        user_fid: z.string(),
        user_username: z.string(),
        user_pfp: z.string().min(1),
      })
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      const authorized = await auth(req);
      // If you throw, the user will not be able to upload
      if (!authorized) throw new UploadThingError("Unauthorized");

      const user = await getOrCreateUser(
        input.user_fid,
        input.user_username,
        input.user_pfp
      );

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { authorized: true, fid: user.fid };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.fid);
      console.log("file url", file.ufsUrl);

      // Persist the file data to your database
      await saveFile({
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        uploadedBy: metadata.fid,
      });

      // Revalidate the route that can be used for polling
      revalidateTag(`/api/file/${metadata.fid}`);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.fid,
        fileId: file.key,
        accessUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

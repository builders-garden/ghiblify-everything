import { eq } from "drizzle-orm";

import { db } from "@/db";
import { files, User, users } from "@/db/schema";

/**
 * Get or create a user
 * @param fid - The user ID of the user
 * @param name - The name of the user
 * @param pfp - The profile picture of the user
 * @returns The user that was created or found
 */
export const getOrCreateUser = async (
  fid: string,
  name: string,
  pfp: string
): Promise<User> => {
  const user = await db.query.users.findFirst({ where: eq(users.fid, fid) });
  // if user doesn't exist, create it
  if (!user) {
    const newUser = await db
      .insert(users)
      .values({ fid, name, pfp })
      .returning({
        fid: users.fid,
        name: users.name,
        pfp: users.pfp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .then((x) => x[0] ?? "");
    return newUser;
  }
  return user;
};

/**
 * Save a file to the database
 * @param file - The file to save
 * @returns The file that was saved
 */
export const saveFile = async (file: {
  key: string;
  name: string;
  url: string;
  uploadedBy: string;
}) => {
  return await db.insert(files).values({
    key: file.key,
    name: file.name,
    url: file.url,
    uploadedBy: file.uploadedBy,
  });
};

/**
 * Save a list of files to the database
 * @param generatedFiles - The list of files to save
 * @returns The file that was saved
 */
export const saveFiles = async (
  generatedFiles: {
    key: string;
    name: string;
    url: string;
    uploadedBy: string;
  }[]
) => {
  return await db.insert(files).values(generatedFiles);
};

/**
 * Get a file from the database
 * @param userFid - The user ID of the user who uploaded the file
 * @returns The file that was found
 */
export const getFiles = async (userFid: string) => {
  return await db.query.files.findMany({
    where: eq(files.uploadedBy, userFid),
  });
};

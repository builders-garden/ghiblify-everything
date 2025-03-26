import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // pinata
    PINATA_JWT_SECRET: z.string().min(1),
    // neynar
    NEYNAR_API_KEY: z.string().min(1),
    // private key for the wallet that will be used to deploy NFTs
    PRIVATE_KEY: z.string().min(1),
    // replicate
    REPLICATE_API_TOKEN: z.string().min(1),
    // uploadthing
    UPLOADTHING_TOKEN: z.string().base64(),
    SECURE_UPLOAD_TOKEN: z.string().min(1),
    // database
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // app url
    NEXT_PUBLIC_URL: z.string().url().min(1),
    // pinata gateway url
    NEXT_PUBLIC_GATEWAY_URL: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

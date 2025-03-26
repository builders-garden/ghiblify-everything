import { fileURLToPath } from "node:url";

import createJiti from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti("./src/lib/env.mjs");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.reservoir.tools",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wrpcd.net",
        pathname: "/cdn-cgi/**",
      },
      {
        protocol: "https",
        hostname: "l39hix1ypd.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;

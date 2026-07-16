import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: "/timeline/:site",
        destination: "/explore/:site",
        permanent: false,
      },
      {
        source: "/viewer/:site",
        destination: "/explore/:site",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

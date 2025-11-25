module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "image.solanatracker.io",
        pathname: "/proxy",
      },
    ],
  },
};

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
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.jup.ag",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "424565.fs1.hubspotusercontent-na1.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.prestocks.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.instadapp.io",
        pathname: "/**",
      },
    ],
  },
};

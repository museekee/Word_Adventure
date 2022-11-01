module.exports = {
    resolve: {
      extensions: [
        ".ts",
        ".tsx",
        ".js",
        ".json",
      ],
      // -----
      alias: {
        "@lib": path.resolve(__dirname, "src/lib"),
        "@assets": path.resolve(__dirname, "src/assets"),
      },
      // ----
    },
  };
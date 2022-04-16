const path = require("path");

module.exports = {
  entry: "./client/reversi.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
};

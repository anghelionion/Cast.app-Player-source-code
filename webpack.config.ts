import "webpack-dev-server";
import path from "path";

import CopyPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackTagsPlugin from "html-webpack-tags-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type { Configuration } from "webpack";
import { EnvironmentPlugin } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

import env from "./env";

const isProduction = process.env.NODE_ENV === "production";

const basePath = "/play";

// Assets in bundlePath are immutable (the name contains the hash) and so can have a long cache time.
const bundlePath = "bundle";
const modulesFolder = "./src/modules/";
const srcFileGlob = "src.*.js";
const srcPathGlob = `${modulesFolder}${srcFileGlob}` as const;

const plugins: Configuration["plugins"] = [
  new MiniCssExtractPlugin({
    filename: `${bundlePath}/[name].[chunkhash].css`,
  }),
  new EnvironmentPlugin(env),
  new CopyPlugin({
    patterns: [
      { from: "json/*.json", to: "static/[name][ext]" },
      { from: srcPathGlob, to: `${bundlePath}/[name].js` },
    ],
  }),
  new HtmlWebpackPlugin({
    basePath,
    /* eslint-disable spellcheck/spell-checker */
    minify: isProduction
      ? {
          collapseWhitespace: true,
          keepClosingSlash: true,
          minifyJS: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        }
      : false,
    /* eslint-enable spellcheck/spell-checker */
    template: "./index.html",
  }),
  new HtmlWebpackTagsPlugin({
    append: true,
    scripts: { glob: srcFileGlob, globPath: modulesFolder, path: bundlePath },
  }),
];
if (process.env.BUNDLE_ANALYZER) {
  plugins.push(new BundleAnalyzerPlugin());
}

const config: Configuration = {
  devServer: {
    client: {
      logging: "error",
      overlay: { errors: true, warnings: false },
    },
    historyApiFallback: { index: `${basePath}/index.html` },
    open: `${basePath}/demo/demo`,
    port: 5001,
    static: false,
    watchFiles: ["index.html", srcPathGlob, "json/*.json"],
  },
  devtool: !isProduction && "eval-source-map", // eslint-disable-line spellcheck/spell-checker
  entry: `${modulesFolder}index.js`,
  mode: isProduction ? "production" : "development",
  module: {
    rules: [
      {
        include: /\.module.css$/,
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1, modules: true },
          },
        ],
      },
      {
        exclude: /\.module.css$/,
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
    ],
  },
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()],
  },
  output: {
    filename: `${bundlePath}/[name]${isProduction ? ".[chunkhash]" : ""}.js`,
    path: path.join(__dirname, "server/build"),
    publicPath: `${basePath}/`,
  },
  plugins,
};

// eslint-disable-next-line import/no-unused-modules
export default config;

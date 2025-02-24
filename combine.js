/* eslint-disable spellcheck/spell-checker */
const { createHash } = require("crypto");
const { readFile, readdir, unlink, writeFile } = require("fs/promises");
const { resolve } = require("path");

const { minify } = require("terser");

const env = require("./env");

// This code is a hack to combine all of the JS files, which we need for two reasons:
// 1. The player's JS files aren't written as modules.
// 2. The player injects a lot of HTML that expects JS functions to be available in the global scope.
// TODO: Rewrite the JS files into modules so we don't need this.

const importantFileOrder = [
  "variables.js",
  "base64uuid.js",
  "playbackEnvironment.js",
  "cast.app.js",
  "WidgetBase.js",
  "LabelWidget.js",
];

void getFiles("./src").then(async (files) => {
  const isProduction = process.env.NODE_ENV === "production";
  const deleteGeneratedPromise = Promise.all(
    files
      .filter(
        (file) =>
          file.includes("/src/modules/src.") &&
          (isProduction || !file.includes("/src.combined.js"))
      )
      .map(unlink)
  );
  const contents = await Promise.all(
    files
      .filter((file) => !file.includes("/src/modules/") && file.endsWith(".js"))
      .sort((a, b) => {
        const aImportant = importantFileOrder.findIndex((file) =>
          a.endsWith(file)
        );
        const bImportant = importantFileOrder.findIndex((file) =>
          b.endsWith(file)
        );
        if (aImportant > -1 && bImportant > -1) {
          return aImportant - bImportant;
        }
        if (aImportant > -1) {
          return -1;
        }
        if (bImportant > -1) {
          return 1;
        }
        return a.localeCompare(b);
      })
      .map((file) => readFile(file, "utf8"))
  );
  await deleteGeneratedPromise;
  let combined = contents.join("\n");
  const filledEnv = { ...env, ...process.env };
  const envKeys = Object.keys(env);
  envKeys.push("NODE_ENV");
  for (const key of envKeys) {
    combined = combined.replaceAll(
      `process.env.${key}`,
      filledEnv[key] === undefined ? "undefined" : `"${filledEnv[key]}"`
    );
  }

  let hash;
  if (isProduction) {
    combined = (await minify(combined)).code;
    hash = createHash("md5").update(combined).digest("hex");
  } else {
    combined = `/*\n************************************************\nTHIS FILE IS GENERATED, DO NOT MODIFY OR COMMIT.\nSee combine.js\n************************************************\n*/\n\n${combined}`;
    hash = "combined";
  }

  await writeFile(`./src/modules/src.${hash}.js`, combined);
});

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

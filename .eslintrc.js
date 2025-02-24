const skipWords = require("@cast-corp/eslint-config/skipWords");

module.exports = {
  extends: [
    "@cast-corp/eslint-config/cypress",
    "@cast-corp/eslint-config/ts",
    "@cast-corp/eslint-config/ci-ts",
  ],
  globals: { gsap: "readable" },
  overrides: [
    { files: ["cypress/**"], rules: { "class-methods-use-this": "off" } },
  ],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "spellcheck/spell-checker": [
      "warn",
      {
        skipWords: [...skipWords, "cy", "globals", "gsap", "minimizer", "req"],
        strings: false,
        templates: false,
      },
    ],
  },
};

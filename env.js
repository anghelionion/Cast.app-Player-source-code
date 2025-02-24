const { config } = require("dotenv");

if (process.env.NODE_ENV !== "production") {
  config({ path: `./configs/${process.env.DEV_CONFIG || "pydcast"}.env` });
}

module.exports = {
  /* eslint-disable @typescript-eslint/naming-convention */
  ASSETS_BUCKET: null,
  CDN_BASE_URL: null,
  GOODTIME_PARTNER_ID: null,
  SERVER_BASE_URL: null,
  /* eslint-enable @typescript-eslint/naming-convention */
};

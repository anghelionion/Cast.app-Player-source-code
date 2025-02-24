import path from "path";

import express from "express";

const app = express();

// GCP check routes
app.get("/_ah/warmup", (_, res) => {
  res.sendStatus(200);
});
app.get("/ping", (_, res) => {
  res.sendStatus(200);
});

// HTML & 404
const indexPath = path.join(__dirname, "build", "index.html");
app.use((req, res) => {
  if (req.accepts("html") !== false) {
    const ext = path.extname(req.path);
    if (!ext || ext === ".html") {
      res.sendFile(indexPath, {
        // AppEngine always uses the same ETag and last modified date
        // eslint-disable-next-line spellcheck/spell-checker
        etag: false,
        lastModified: false,
      });
      return;
    }
  }
  res.status(404);
  res.json({ error: "Not found" });
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}...`);
});

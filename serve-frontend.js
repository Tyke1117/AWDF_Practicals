const express = require("./backend/node_modules/express");
const path = require("path");

const app = express();
const PORT = 5173;

app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Frontend] Practical 13 TaskFlow Pro UI running on http://localhost:${PORT}`);
});

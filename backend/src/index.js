require("dotenv").config();
const express = require("express");
const cors = require("cors");

const healthRouter = require("./routes/health");

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
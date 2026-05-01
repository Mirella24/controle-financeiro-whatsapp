require("dotenv").config();

const express = require("express");
const { webhook } = require("./controllers/webhook.controller");

const app = express();

app.use(express.json());

app.post("/webhook", webhook);

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
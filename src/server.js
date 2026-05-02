import 'dotenv/config';
import express from 'express';
import { webhook } from './controllers/webhook.controller.js';

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
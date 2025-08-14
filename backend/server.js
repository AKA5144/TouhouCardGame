import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/discord.js";
import { deckRouter } from "./routes/deck.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL, 
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use('/oauth', authRouter);
app.use('/deck', deckRouter);

app.listen(port, () => {
  console.log(`✅ Backend ready on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRouter} from './routes/discord.js';
import { deckRouter } from "./routes/deck.js";

// Chargement .env externe
dotenv.config({ path: '../BotPython/Data/.env' });

const app = express();
const port = 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/oauth', authRouter);
app.use("/deck", deckRouter);

app.listen(port, () => {
  console.log(`✅ Backend ready at http://localhost:${port}`);
});

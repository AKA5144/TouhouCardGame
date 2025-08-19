import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/discord.js";
import { deckRouter } from "./routes/deck.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Liste des origines autorisées
const allowedOrigins = [
  "https://aka5144.github.io",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // autorise Postman ou fetch sans origin
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'CORS policy does not allow this origin';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // nécessaire si tu utilises cookies
}));

app.use(cookieParser());
app.use(express.json());

app.use('/oauth', authRouter);
app.use('/deck', deckRouter);

app.listen(port, () => {
  console.log(`✅ Backend ready on port ${port}`);
});

import express from "express";
import db from "../db.js";
import { verifyToken } from './discord.js';

export const deckRouter = express.Router();

deckRouter.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM deck");
    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération deck:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

deckRouter.get("/card", async (req, res) => {
  const deckId = req.query.id;

  if (!deckId) {
    return res.status(400).json({ error: "Le paramètre 'id' est requis." });
  }

  try {
    const query = "SELECT * FROM card WHERE deck_id = ?";
    const [cards] = await db.query(query, [deckId]);
    res.json(cards);
  } catch (err) {
    console.error("Erreur récupération cartes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

deckRouter.get("/user-cards", verifyToken, async (req, res) => {
  const discordId = req.user.id;
  const deckId = req.query.deckId;

  if (!deckId) return res.status(400).json({ error: "deckId is required" });

  try {
    const [deckCards] = await db.query(
      "SELECT * FROM card WHERE deck_id = ? OR id = 0",
      [deckId]
    );

    const [userCards] = await db.query(
      "SELECT card_id, quantity_by_rarity FROM user_cards WHERE discord_id = ?",
      [discordId]
    );

    const userCardMap = new Map();
    userCards.forEach(c => {
      let quantities = {0:0,1:0,2:0,3:0,4:0};
      try {
        if (c.quantity_by_rarity) {
          quantities = typeof c.quantity_by_rarity === "string"
            ? JSON.parse(c.quantity_by_rarity)
            : c.quantity_by_rarity;
        }
      } catch (e) {
        console.warn("Invalid JSON for card_id", c.card_id);
      }
      userCardMap.set(c.card_id, quantities);
    });

    const cardsWithOwnership = deckCards.map(card => ({
      ...card,
      owned: userCardMap.has(card.id),
      quantity_by_rarity: userCardMap.get(card.id) || {0:0,1:0,2:0,3:0,4:0}
    }));

    res.json(cardsWithOwnership);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

deckRouter.get('/testdb', async (req, res) => {
  try {
    console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
    const [rows] = await db.query('SELECT 1+1 AS result');
    res.send(`Résultat test : ${rows[0].result}`);
  } catch (err) {
    console.error('Erreur testDB :', err);
    res.status(500).send(`Erreur testDB : ${err.message}`);
  }
});


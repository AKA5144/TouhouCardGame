import express from "express";
import db from "../db.js";
import { verifyToken } from './discord.js';

export const deckRouter = express.Router();

// Récupérer tous les decks
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
    // toutes les cartes du deck
    const [cards] = await db.query("SELECT * FROM card WHERE deck_id = ?", [deckId]);

    // total de cartes distinctes dans le deck
    const [[{ totalCount }]] = await db.query(
      "SELECT COUNT(*) AS totalCount FROM card WHERE deck_id = ?",
      [deckId]
    );

    res.json({ totalCount, cards });
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
    // toutes les cartes du deck
    const [deckCards] = await db.query(
      "SELECT * FROM card WHERE deck_id = ?",
      [deckId]
    );

    // cartes possédées par l'utilisateur (distinctes, peu importe la rareté)
    const [userCards] = await db.query(
      `SELECT DISTINCT uc.card_id
       FROM user_cards uc
       JOIN card c ON c.id = uc.card_id
       WHERE uc.discord_id = ? AND c.deck_id = ?`,
      [discordId, deckId]
    );

    // map pour récupérer quantity_by_rarity par card_id
    const [userCardsFull] = await db.query(
      "SELECT card_id, quantity_by_rarity FROM user_cards WHERE discord_id = ?",
      [discordId]
    );

    const userCardMap = new Map();
    userCardsFull.forEach(c => {
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

    // Ajouter flag owned et quantity_by_rarity à chaque carte
    const cardsWithOwnership = deckCards.map(card => {
      const owned = userCardMap.has(card.id);
      return {
        ...card,
        owned,
        quantity_by_rarity: userCardMap.get(card.id) || {0:0,1:0,2:0,3:0,4:0},
        image: owned ? card.image : null   // 🚀 image supprimée si pas owned
      };
    });

    res.json({
      totalCount: deckCards.length,
      ownedCount: userCards.length,
      cards: cardsWithOwnership
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



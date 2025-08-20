import { useParams, useSearchParams } from "react-router-dom";
import DiscordLogin from "../components/DiscordLogin";
import React, { useEffect, useState } from "react";
import "../Style/common/main.css";
import CardDisplay from "../components/card";
import { Link } from "react-router-dom";

type Card = {
  id: number;
  name: string;
  image_url: string;
  owned: boolean;
};

export default function DeckDetailPage() {
  const { deckName } = useParams<{ deckName: string }>();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get("id");

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId) return;

    setLoading(true);
    setError(null);

      fetch(`https://TouhouCardGameBackend.onrender.com/deck/user-cards?deckId=${encodeURIComponent(deckId)}`, {
        method: "GET",
        credentials: "include",
      })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data: Card[]) => {
        setCards(data);
      })
      .catch((err) => {
        setError(err.message || "Erreur inconnue");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deckId]);

  const placeholderCard = cards.find(c => c.id === 0);

  const cardsWithoutPlaceholder = cards.filter(card => card.id !== 0);

  return (
    <div className="overlay_box">
      <DiscordLogin />

      <a className="title_link">
        <p className="title_text text-4xl sm:text-5xl md:text-6xl lg:text-7xl" style={{ marginBottom: 4 }}>
          {deckName}
        </p>
      </a>

      <p style={{ marginTop: 8, marginBottom: 8 }}>
        <Link to="/decks" style={{ color: "#000", textDecoration: "underline" }}>
          ← Back to Decks
        </Link>
      </p>

      {loading && <p>Chargement des cartes...</p>}
      {error && <p style={{ color: "red" }}>Erreur: {error}</p>}

      <CardDisplay
        cards={cardsWithoutPlaceholder}
        placeholder={placeholderCard}
      />
    </div>
  );
}

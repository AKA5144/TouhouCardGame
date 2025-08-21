import { useParams, useSearchParams, Link } from "react-router-dom";
import DiscordLogin from "../components/DiscordLogin";
import React, { useEffect, useState } from "react";
import "../Style/common/main.css";
import CardDisplay from "../components/card";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId) return;

    const fetchCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://TouhouCardGameBackend.onrender.com/deck/user-cards?deckId=${encodeURIComponent(deckId)}`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) throw new Error("Erreur réseau");

        const data = await res.json();
        setCards(data.cards || []);
      } catch (err: any) {
        setError(err.message ?? "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [deckId]);

  // Extraire placeholder (id=0) et filtrer le reste
  const placeholderCard = cards.find((c) => c.id === 0);
  const cardsWithoutPlaceholder = cards.filter((c) => c.id !== 0);

  return (
    <div className="overlay_box">
      <DiscordLogin />

      <h1 className="title_text text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2">
        {deckName}
      </h1>

      <p className="mb-4">
        <Link to="/decks" className="underline text-black">
          ← Back to Decks
        </Link>
      </p>

      {loading && <p>Chargement des cartes...</p>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      {!loading && !error && (
        <CardDisplay
          cards={cardsWithoutPlaceholder}
          placeholder={placeholderCard}
        />
      )}
    </div>
  );
}

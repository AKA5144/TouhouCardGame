import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Style/game/card.css";

interface Deck {
  ID: number;
  name: string;
  image_url: string;
  image_hover_url: string;
  ownedCount: number;
  totalCount: number; 
}

function DeckCard({ deck }: { deck: Deck }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      to={`/deck/${encodeURIComponent(deck.name)}?id=${deck.ID}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-block",
        width: "220px",
        height: "300px",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      <div
        className="card"
        style={{
          backgroundImage: `url(${hover ? deck.image_hover_url : deck.image_url})`,
          transform: hover ? "scale(1.05)" : "scale(1)",
          cursor: "pointer",
          width: "100%",
          height: "100%",
          transition: "transform 0.2s ease",
          borderRadius: "12px",
          position: "relative",
        }}
      >
        <h3>{deck.name}</h3>

        {/* Affichage owned/total au hover */}
        {hover && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {deck.ownedCount}/{deck.totalCount}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function DeckDisplay() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    fetch("https://TouhouCardGameBackend.onrender.com/deck")
      .then((res) => res.json())
      .then(async (data: Deck[]) => {
        const decksWithCounts = await Promise.all(
          data.map(async (deck) => {
            try {
              const res = await fetch(
                `https://TouhouCardGameBackend.onrender.com/deck/user-cards?deckId=${deck.ID}`,
                { credentials: "include" }
              );
              const userData = await res.json();
              return {
                ...deck,
                ownedCount: userData.ownedCount,
                totalCount: userData.totalCount,
              };
            } catch (err) {
              console.error(err);
              return { ...deck, ownedCount: 0, totalCount: 0 };
            }
          })
        );
        setDecks(decksWithCounts);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card_collection_box">
      {decks.map((d) => (
        <DeckCard key={d.ID} deck={d} />
      ))}
    </div>
  );
}


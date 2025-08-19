import { useEffect, useState } from "react";
import "../Style/game/card.css";

interface Deck {
  ID: number;
  name: string;
  image_url: string;
  image_hover_url: string;
}

function DeckCard({ deck }: { deck: Deck }) {
  const [hover, setHover] = useState(false);

  const url = `/deck/${encodeURIComponent(deck.name)}?id=${deck.ID}`;

  return (
    <a
      href={url}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-block",
        width: "220px",
        height: "300px",
        textDecoration: "none",
        color: "inherit",
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
        }}
      >
        <h3>{deck.name}</h3>
      </div>
    </a>
  );
}


export default function DeckDisplay() {
  const [deck, setDeck] = useState<Deck[]>([]);

  useEffect(() => {
    fetch("https://TouhouCardGameBackend.onrender.com/deck")
      .then((res) => res.json())
      .then((data) => setDeck(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card_collection_box">
      {deck.map((d) => (
        <DeckCard key={d.ID} deck={d} />
      ))}
    </div>
  );
}

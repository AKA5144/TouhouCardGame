import { useState, useEffect } from "react";
import QuantityTooltip from "./CardQuantity";
import { getHighestRarity, rarityImages } from "./CardRarity";
import type { QuantityByRarity } from "./CardRarity";

interface Card {
  id: number;
  name: string;
  image_url?: string;
  owned?: boolean;
  quantity_by_rarity?: QuantityByRarity;
}

interface CardListProps {
  cards: Card[];
  placeholder?: Card;
}

export default function CardDisplay({ cards, placeholder }: CardListProps) {
  const placeholderImageUrl = placeholder?.image_url || "";
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [borderIndexes, setBorderIndexes] = useState<Record<number, number>>({});

  useEffect(() => {
    const initialIndexes: Record<number, number> = {};
    cards.forEach((card) => {
      if (card.owned && card.quantity_by_rarity) {
        const ownedRarities = Object.entries(card.quantity_by_rarity)
          .filter(([_, qty]) => qty > 0)
          .map(([rarity]) => parseInt(rarity))
          .sort((a, b) => a - b);
        if (ownedRarities.length > 0) {
          const highest = Math.max(...ownedRarities);
          initialIndexes[card.id] = ownedRarities.indexOf(highest);
        }
      }
    });
    setBorderIndexes(initialIndexes);
  }, [cards]);

  const handleCardClick = (card: Card) => {
    if (!card.owned || !card.quantity_by_rarity) return;
    const ownedRarities = Object.entries(card.quantity_by_rarity)
      .filter(([_, qty]) => qty > 0)
      .map(([rarity]) => parseInt(rarity))
      .sort((a, b) => a - b);
    if (ownedRarities.length === 0) return;
    setBorderIndexes((prev) => {
      const currentIndex = prev[card.id] ?? 0;
      const nextIndex = (currentIndex + 1) % ownedRarities.length;
      return { ...prev, [card.id]: nextIndex };
    });
  };

  return (
    <div className="card_collection_box flex flex-wrap gap-4">
      {cards.map((card) => {
        const highestRarity = card.quantity_by_rarity
          ? getHighestRarity(card.quantity_by_rarity)
          : null;
        const ownedRarities = card.quantity_by_rarity
          ? Object.entries(card.quantity_by_rarity)
              .filter(([_, qty]) => qty > 0)
              .map(([rarity]) => parseInt(rarity))
              .sort((a, b) => a - b)
          : [];
        const currentRarity =
          ownedRarities[borderIndexes[card.id] ?? 0] ?? highestRarity;

        // Chemins corrigés pour GitHub Pages
        const cardImageUrl = card.owned
          ? `/TouhouCardGame/${card.image_url}`
          : `/TouhouCardGame/${placeholderImageUrl}`;

        return (
          <div
            key={card.id}
            className="card relative"
            style={{
              backgroundImage: `url(${cardImageUrl})`,
              cursor: card.owned ? "pointer" : "default",
              height: "270px",
              width: "180px",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onMouseEnter={() => setHoveredCardId(card.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            onClick={() => handleCardClick(card)}
          >
            {/* Bordure */}
            {currentRarity !== null && currentRarity > 0 && (
              <img
                src={rarityImages[currentRarity]}
                alt={`Border rarity ${currentRarity}`}
                className="absolute inset-0 pointer-events-none object-cover"
              />
            )}

            {/* Nom carte */}
            {card.owned && (
              <h3 className="absolute top-2 left-2 text-white font-bold drop-shadow-lg">
                {card.name}
              </h3>
            )}

            {/* Tooltip rareté */}
            {card.owned && hoveredCardId === card.id && (
              <QuantityTooltip
                quantity_by_rarity={
                  card.quantity_by_rarity ?? { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

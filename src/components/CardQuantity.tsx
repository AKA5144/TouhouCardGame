export type QuantityByRarity = {
  [key: number]: number;
};

export default function QuantityTooltip({
  quantity_by_rarity,
}: {
  quantity_by_rarity: QuantityByRarity;
}) {
  const rarityNames = ["Common", "Bronze", "Silver", "Gold", "Rainbow"];

  const total = Object.values(quantity_by_rarity).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
        <div
      className="absolute bottom-2 right-2 text-white p-2 rounded-md z-10"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="font-bold mb-1">Total: {total}</div>
      <ul className="m-0 p-0 list-none">
        {Object.entries(quantity_by_rarity)
          .filter(([_, value]) => value > 0)
          .map(([key, value]) => (
            <li key={key}>
              {rarityNames[parseInt(key)]}: {value}
            </li>
          ))}
      </ul>
    </div>
  );
}





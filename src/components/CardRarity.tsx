
export type QuantityByRarity = {
  0: number; 
  1: number;
  2: number;
  3: number; 
  4: number; 
};

export const rarityImages: Record<number, string> = {
  1: "/Assets/Border/bronze.png",
  2: "/Assets/Border/silver.png",
  3: "/Assets/Border/gold.png",
  4: "/Assets/Border/rainbow.png",
};

export function getHighestRarity(qty: QuantityByRarity): number | null {
  const rarities: (keyof QuantityByRarity)[] = [4, 3, 2, 1]; 
  for (const rarity of rarities) {
    if (qty[rarity] > 0) {
      return rarity;
    }
  }
  return null; 
}

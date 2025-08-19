
export type QuantityByRarity = {
  0: number; 
  1: number;
  2: number;
  3: number; 
  4: number; 
};

export const rarityImages: Record<number, string> = {
  1: `${process.env.PUBLIC_URL}/Assets/Border/bronze.png`,
  2: `${process.env.PUBLIC_URL}/Assets/Border/silver.png`,
  3: `${process.env.PUBLIC_URL}/Assets/Border/gold.png`,
  4: `${process.env.PUBLIC_URL}/Assets/Border/rainbow.png`,
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

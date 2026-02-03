export interface BrandOption {
  brand: string;
  models: string[];
}

export const BRAND_OPTIONS: BrandOption[] = [
  { brand: "Dacia", models: ["Logan", "Sandero", "Duster", "Jogger"] },
  { brand: "Volkswagen", models: ["Golf", "Passat", "Polo", "Tiguan"] },
  { brand: "Skoda", models: ["Octavia", "Fabia", "Superb", "Kodiaq"] },
  { brand: "Renault", models: ["Clio", "Megane", "Captur", "Kadjar"] },
  { brand: "Ford", models: ["Focus", "Fiesta", "Kuga", "Mondeo"] },
  { brand: "BMW", models: ["Seria 1", "Seria 3", "Seria 5", "X3"] },
  { brand: "Audi", models: ["A3", "A4", "A6", "Q5"] },
  { brand: "Toyota", models: ["Corolla", "Yaris", "RAV4", "C-HR"] },
  { brand: "Hyundai", models: ["i20", "i30", "Tucson", "Kona"] },
];

export function getModelsForBrand(brand: string): string[] {
  const match = BRAND_OPTIONS.find((item) => item.brand === brand);
  return match?.models ?? [];
}

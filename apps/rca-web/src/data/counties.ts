export interface CountyOption {
  county: string;
  localities: string[];
}

export const COUNTY_OPTIONS: CountyOption[] = [
  {
    county: "Bucuresti",
    localities: ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6"],
  },
  {
    county: "Ilfov",
    localities: ["Voluntari", "Otopeni", "Popesti-Leordeni", "Pantelimon"],
  },
  {
    county: "Cluj",
    localities: ["Cluj-Napoca", "Turda", "Dej", "Floresti"],
  },
  {
    county: "Timis",
    localities: ["Timisoara", "Lugoj", "Sannicolau Mare", "Dumbravita"],
  },
  {
    county: "Iasi",
    localities: ["Iasi", "Pascani", "Harlau", "Miroslava"],
  },
  {
    county: "Constanta",
    localities: ["Constanta", "Mangalia", "Medgidia", "Navodari"],
  },
  {
    county: "Brasov",
    localities: ["Brasov", "Sacele", "Fagaras", "Rasnov"],
  },
  {
    county: "Prahova",
    localities: ["Ploiesti", "Campina", "Baicoi", "Mizil"],
  },
  {
    county: "Dolj",
    localities: ["Craiova", "Bailesti", "Calafat", "Filiasi"],
  },
  {
    county: "Arges",
    localities: ["Pitesti", "Mioveni", "Curtea de Arges", "Campulung"],
  },
];

export function getLocalitiesForCounty(county: string): string[] {
  const match = COUNTY_OPTIONS.find((item) => item.county === county);
  return match?.localities ?? [];
}

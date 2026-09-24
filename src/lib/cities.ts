export type City = {
  slug: string;
  name: string;
  /** „din București”, „din Cluj-Napoca” */
  from: string;
  /** „în București” */
  inLocative: string;
  county: string;
};

/** Top 15 RO cities for local SEO hubs + money-keyword spokes */
export const CITIES: City[] = [
  {
    slug: "bucuresti",
    name: "București",
    from: "din București",
    inLocative: "în București",
    county: "București",
  },
  {
    slug: "cluj-napoca",
    name: "Cluj-Napoca",
    from: "din Cluj-Napoca",
    inLocative: "în Cluj-Napoca",
    county: "Cluj",
  },
  {
    slug: "timisoara",
    name: "Timișoara",
    from: "din Timișoara",
    inLocative: "în Timișoara",
    county: "Timiș",
  },
  {
    slug: "iasi",
    name: "Iași",
    from: "din Iași",
    inLocative: "în Iași",
    county: "Iași",
  },
  {
    slug: "brasov",
    name: "Brașov",
    from: "din Brașov",
    inLocative: "în Brașov",
    county: "Brașov",
  },
  {
    slug: "constanta",
    name: "Constanța",
    from: "din Constanța",
    inLocative: "în Constanța",
    county: "Constanța",
  },
  {
    slug: "craiova",
    name: "Craiova",
    from: "din Craiova",
    inLocative: "în Craiova",
    county: "Dolj",
  },
  {
    slug: "galati",
    name: "Galați",
    from: "din Galați",
    inLocative: "în Galați",
    county: "Galați",
  },
  {
    slug: "oradea",
    name: "Oradea",
    from: "din Oradea",
    inLocative: "în Oradea",
    county: "Bihor",
  },
  {
    slug: "sibiu",
    name: "Sibiu",
    from: "din Sibiu",
    inLocative: "în Sibiu",
    county: "Sibiu",
  },
  {
    slug: "ploiesti",
    name: "Ploiești",
    from: "din Ploiești",
    inLocative: "în Ploiești",
    county: "Prahova",
  },
  {
    slug: "arad",
    name: "Arad",
    from: "din Arad",
    inLocative: "în Arad",
    county: "Arad",
  },
  {
    slug: "pitesti",
    name: "Pitești",
    from: "din Pitești",
    inLocative: "în Pitești",
    county: "Argeș",
  },
  {
    slug: "bacau",
    name: "Bacău",
    from: "din Bacău",
    inLocative: "în Bacău",
    county: "Bacău",
  },
  {
    slug: "targu-mures",
    name: "Târgu Mureș",
    from: "din Târgu Mureș",
    inLocative: "în Târgu Mureș",
    county: "Mureș",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function cityHubPath(citySlug: string) {
  return `/servicii/oras/${citySlug}`;
}

export function cityServicePath(citySlug: string, serviceSlug: string) {
  return `/servicii/oras/${citySlug}/${serviceSlug}`;
}

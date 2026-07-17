export type ExoplanetRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type ExoplanetType = "Terrestrial" | "Super-Earth" | "Gas Giant" | "Ice Giant";

export interface ExoplanetAsset {
  id: string;
  name: string;
  discoveryYear: number;
  distance: number; // light-years
  radius: number; // in Earth radii (for Terrestrial/Super-Earth) or Jupiter radii (for Giants)
  radiusUnit: "R⊕" | "Rⱼ";
  mass: number; // in Earth masses or Jupiter masses
  massUnit: "M⊕" | "Mⱼ";
  temperature: number; // Kelvin
  hostStar: string;
  rarity: ExoplanetRarity;
  type: ExoplanetType;
  availableSupply: number;
  maxSupply: number;
  initialPrice: number; // XLM
  verificationBadge: boolean;
  description: string;
  textureName: "earth" | "venus" | "mars" | "jupiter" | "saturn" | "neptune" | "uranus" | "mercury";
  color: string; // Theme hex code
  orbitalPeriod: number; // days
  eccentricity: number; // orbit eccentricity
}

export const EXOPLANETS_DATA: ExoplanetAsset[] = [
  {
    id: "kepler_452b",
    name: "Kepler-452b",
    discoveryYear: 2015,
    distance: 1402,
    radius: 1.5,
    radiusUnit: "R⊕",
    mass: 5.0,
    massUnit: "M⊕",
    temperature: 265,
    hostStar: "Kepler-452",
    rarity: "Legendary",
    type: "Super-Earth",
    availableSupply: 1,
    maxSupply: 1,
    initialPrice: 2500,
    verificationBadge: true,
    description: "Often referred to as Earth's Cousin or Earth 2.0, Kepler-452b orbits a G2V star very similar to our Sun in the habitable zone. It is 60% larger than Earth and has a high probability of possessing a rocky surface and atmospheric water vapour.",
    textureName: "earth",
    color: "#10B981", // Emerald green
    orbitalPeriod: 384.8,
    eccentricity: 0.03,
  },
  {
    id: "trappist_1e",
    name: "TRAPPIST-1e",
    discoveryYear: 2017,
    distance: 39.5,
    radius: 0.92,
    radiusUnit: "R⊕",
    mass: 0.69,
    massUnit: "M⊕",
    temperature: 251,
    hostStar: "TRAPPIST-1",
    rarity: "Legendary",
    type: "Terrestrial",
    availableSupply: 5,
    maxSupply: 5,
    initialPrice: 1800,
    verificationBadge: true,
    description: "Located in the ultra-cool dwarf star system TRAPPIST-1, planet e is the most Earth-like in terms of size, density, and stellar radiation. It resides in the core of the habitable zone, with high potential for liquid water oceans and a stable atmosphere.",
    textureName: "mars", // Reddish terrestrial
    color: "#EF4444", // Red
    orbitalPeriod: 6.1,
    eccentricity: 0.007,
  },
  {
    id: "proxima_b",
    name: "Proxima Centauri b",
    discoveryYear: 2016,
    distance: 4.24,
    radius: 1.03,
    radiusUnit: "R⊕",
    mass: 1.07,
    massUnit: "M⊕",
    temperature: 234,
    hostStar: "Proxima Centauri",
    rarity: "Epic",
    type: "Terrestrial",
    availableSupply: 10,
    maxSupply: 10,
    initialPrice: 1200,
    verificationBadge: true,
    description: "The closest known exoplanet to Earth, Proxima Centauri b orbits in the habitable zone of our solar system's nearest stellar neighbor. Despite stellar flares from its red dwarf host, it remains one of the prime candidates for search of biosignatures.",
    textureName: "mercury", // Cratered terrestrial
    color: "#6B7280", // Gray
    orbitalPeriod: 11.2,
    eccentricity: 0.11,
  },
  {
    id: "cancri_55_e",
    name: "55 Cancri e",
    discoveryYear: 2004,
    distance: 41,
    radius: 1.88,
    radiusUnit: "R⊕",
    mass: 8.08,
    massUnit: "M⊕",
    temperature: 2400,
    hostStar: "55 Cancri A",
    rarity: "Legendary",
    type: "Super-Earth",
    availableSupply: 3,
    maxSupply: 3,
    initialPrice: 2200,
    verificationBadge: true,
    description: "A carbon-rich super-Earth so close to its star that its surface is a molten ocean of lava. Due to intense pressure and carbon abundance, scientists hypothesize that a significant fraction of its mass could be crystallized carbon, effectively making it a diamond world.",
    textureName: "venus", // Super hot glowing appearance
    color: "#F59E0B", // Amber
    orbitalPeriod: 0.73,
    eccentricity: 0.05,
  },
  {
    id: "hd_189733b",
    name: "HD 189733b",
    discoveryYear: 2005,
    distance: 64.5,
    radius: 1.13,
    radiusUnit: "Rⱼ",
    mass: 1.13,
    massUnit: "Mⱼ",
    temperature: 1200,
    hostStar: "HD 189733",
    rarity: "Epic",
    type: "Gas Giant",
    availableSupply: 8,
    maxSupply: 8,
    initialPrice: 950,
    verificationBadge: true,
    description: "A beautiful cobalt blue gas giant with a deadly climate. It rains molten glass sideways at speeds of over 5,400 mph. Its blue hue comes from light scattering off silicate particles suspended in its high-temperature atmosphere.",
    textureName: "neptune", // Gas giant blue
    color: "#3B82F6", // Blue
    orbitalPeriod: 2.2,
    eccentricity: 0.003,
  },
  {
    id: "wasp_12b",
    name: "WASP-12b",
    discoveryYear: 2008,
    distance: 1410,
    radius: 1.79,
    radiusUnit: "Rⱼ",
    mass: 1.47,
    massUnit: "Mⱼ",
    temperature: 2500,
    hostStar: "WASP-12",
    rarity: "Epic",
    type: "Gas Giant",
    availableSupply: 6,
    maxSupply: 6,
    initialPrice: 850,
    verificationBadge: true,
    description: "An egg-shaped 'hot Jupiter' orbiting so close to its star that it is being slowly devoured. The star's tidal forces stretch the planet into an ellipsoid and strip its outer layers, creating a massive shroud of gas surrounding the system.",
    textureName: "saturn", // Ringed/compressed gas giant style
    color: "#F97316", // Orange
    orbitalPeriod: 1.09,
    eccentricity: 0.05,
  },
  {
    id: "k2_18b",
    name: "K2-18b",
    discoveryYear: 2015,
    distance: 124,
    radius: 2.61,
    radiusUnit: "R⊕",
    mass: 8.63,
    massUnit: "M⊕",
    temperature: 265,
    hostStar: "K2-18",
    rarity: "Rare",
    type: "Super-Earth",
    availableSupply: 15,
    maxSupply: 15,
    initialPrice: 650,
    verificationBadge: true,
    description: "A sub-Neptune super-Earth orbiting in the habitable zone. In 2019, water vapor was detected in its atmosphere, and recent observations suggest it could be a 'Hycean' planet - a world covered in liquid water oceans under a hydrogen-rich atmosphere.",
    textureName: "uranus", // Cyan sub-Neptune
    color: "#06B6D4", // Cyan
    orbitalPeriod: 32.9,
    eccentricity: 0.20,
  },
  {
    id: "lhs_1140b",
    name: "LHS 1140 b",
    discoveryYear: 2017,
    distance: 48.8,
    radius: 1.7,
    radiusUnit: "R⊕",
    mass: 5.6,
    massUnit: "M⊕",
    temperature: 230,
    hostStar: "LHS 1140",
    rarity: "Rare",
    type: "Super-Earth",
    availableSupply: 12,
    maxSupply: 20,
    initialPrice: 550,
    verificationBadge: true,
    description: "A super-Earth orbiting a quiet red dwarf star. It has a density twice that of Earth, suggesting a rocky metal-rich composition. It lies in the habitable zone, making it a prime candidate for studying rocky planet atmospheres.",
    textureName: "earth", // Rocky green-blue
    color: "#059669", // Dark green
    orbitalPeriod: 24.7,
    eccentricity: 0.06,
  },
  {
    id: "kepler_16b",
    name: "Kepler-16b",
    discoveryYear: 2011,
    distance: 245,
    radius: 0.75,
    radiusUnit: "Rⱼ",
    mass: 0.33,
    massUnit: "Mⱼ",
    temperature: 188,
    hostStar: "Kepler-16A & 16B",
    rarity: "Legendary",
    type: "Gas Giant",
    availableSupply: 2,
    maxSupply: 2,
    initialPrice: 2000,
    verificationBadge: true,
    description: "Known as the real-world Tatooine, Kepler-16b is a cold Saturn-mass gas giant orbiting a binary star system. Standing on its surface (if it had one), you would see two suns set on the horizon, creating a spectacular double-shadow effect.",
    textureName: "saturn", // Saturn texture without rings
    color: "#8B5CF6", // Purple
    orbitalPeriod: 228.8,
    eccentricity: 0.007,
  },
  {
    id: "gj_504b",
    name: "Gliese 504 b",
    discoveryYear: 2013,
    distance: 57.3,
    radius: 0.96,
    radiusUnit: "Rⱼ",
    mass: 4.0,
    massUnit: "Mⱼ",
    temperature: 510,
    hostStar: "Gliese 504",
    rarity: "Epic",
    type: "Gas Giant",
    availableSupply: 4,
    maxSupply: 4,
    initialPrice: 1100,
    verificationBadge: true,
    description: "A jovian planet famous for its striking pink color. Because it is a young planet (about 160 million years old), it still glows with the heat of its formation, casting a magenta hue. It orbits its Sun-like star at a distance nine times that of Jupiter's orbit.",
    textureName: "venus", // Pinkish/orange clouds
    color: "#EC4899", // Pink
    orbitalPeriod: 29000,
    eccentricity: 0.0,
  },
  {
    id: "toi_700d",
    name: "TOI-700 d",
    discoveryYear: 2020,
    distance: 101.4,
    radius: 1.14,
    radiusUnit: "R⊕",
    mass: 1.72,
    massUnit: "M⊕",
    temperature: 269,
    hostStar: "TOI-700",
    rarity: "Rare",
    type: "Terrestrial",
    availableSupply: 15,
    maxSupply: 15,
    initialPrice: 480,
    verificationBadge: true,
    description: "An Earth-sized planet orbiting in the habitable zone of an M-dwarf star. It is one of the few Earth-sized planets discovered in a habitable zone by NASA's TESS mission and is expected to have liquid water and a moderate climate.",
    textureName: "mars", // Rocky Terrestrial
    color: "#F97316", // Orange
    orbitalPeriod: 37.4,
    eccentricity: 0.03,
  },
  {
    id: "ogle_hoth",
    name: "OGLE-2005-BLG-390Lb",
    discoveryYear: 2005,
    distance: 21500,
    radius: 1.6,
    radiusUnit: "R⊕",
    mass: 5.5,
    massUnit: "M⊕",
    temperature: 50,
    hostStar: "OGLE-2005-BLG-390L",
    rarity: "Uncommon",
    type: "Super-Earth",
    availableSupply: 25,
    maxSupply: 25,
    initialPrice: 250,
    verificationBadge: true,
    description: "Nicknamed Hoth, this super-Earth is one of the most distant planets discovered. It orbits a red dwarf star so far away and in such a cold orbit that its surface temperature is a frozen 50 K (-223°C), leaving its entire oceans locked in deep ice.",
    textureName: "uranus", // Cold ice blue
    color: "#3B82F6", // Blue
    orbitalPeriod: 3500,
    eccentricity: 0.20,
  }
];

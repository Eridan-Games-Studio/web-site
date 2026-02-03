export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  conceptArt?: string;
  gallery?: string[];
  status: string;
  releaseDate?: string;
  platforms: string[];
  synopsis: string;
  // Categorized classification
  type: string[];      // Game format: Board Game, Card Game, RPG, Skirmish
  players: string[];   // Player interaction: 2vs2, Co-operative, Semi-Cooperative
  theme: string[];     // Setting/style: Investigation, Supernatural, Tactical, etc.
  mechanics: string[];
  features: string[];
  world: string;
  wikiUrl: string;
  distributionOrder: number;
  developers: {
    gameDirector?: string;
    leadNarrativeDesigner?: string;
    leadGameDesigner?: string;
    leadSystemDesigner?: string;
    leadDesigner?: string;
    artDirector?: string;
  };
}

export const games: Game[] = [
  {
    id: "rika-board-game",
    title: "The Rite of Rika",
    slug: "rika-board-game",
    conceptArt: "/content/images/rika-akvira-maro-1.png",  // Add this line
    description: "A tactical 2vs2 board game experience. Jointly command one of the four unique races in an asymmetric strategic battle fought on two fronts using powerful cards, units and limited communication.",
    shortDescription: "2vs2 fully asymmetrical card driven skirmish game with unique rules and mechanics.",
    image: "/content/images/rika-liguni-zeleni.png",

    gallery: [
      "/content/images/rikabgg1.jpg",
      "/content/images/rikabgg2.jpg",
      "/content/images/rikabgg3.jpg"
    ],
    status: "Design Phase",
    releaseDate: "Upcoming",
    platforms: ["TTS-upcoming", "Gamefound"],
    synopsis: "Choose your partner and master the distinct strategies of a unique alien race to claim the Mantle of Ascendancy!",
    type: ["Board Game", "Card Game"],
    players: ["2vs2"],
    theme: ["Tactical"],
    mechanics: ["Dice", "Cards", "Draft", "Unit placement"],
    features: ["Unique races", "Assymetric strategies", "Designed for Pro play"],
    world: "the-age-of-rika",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/games/rika-board-game",
    distributionOrder: 2,
    developers: {
      gameDirector: "Dino Đorić",
      leadNarrativeDesigner: "Tomislav Furlanis",
      leadGameDesigner: "Borjan Dujmović",
      artDirector: "Vuk Dragičević"
    }
  },
  {
    id: "haven-rpg",
    title: "H.A.V.E.N RPG",
    slug: "haven-rpg",
    description: "In this game, you step into Haven City—a place where crime, corruption, and the paranormal overlap. The city itself seems alive, bending events toward chaos while factions, cults, and desperate people fight for control.\n\nAs a player, you'll investigate mysteries, confront the supernatural, and navigate shifting alliances. Every choice carries weight: your reputation, resources, and dark secrets shape not only your fate but how the city responds to you.\n\nExpect tense missions, flavorful downtime, and a constant struggle between survival, influence, and the unseen forces that lurk in every shadow.",
    shortDescription: "A supernatural-noir RPG steeped in crime, occult mystery, and urban paranoia.",
    image: "/content/images/haven.png",
    gallery: [
      "/content/images/haventest1.jpg",
      "/content/images/haventest2.jpg",
      "/content/images/haventest3.jpg"
    ],
    status: "Testing Phase",
    releaseDate: "Upcoming",
    platforms: ["Tabletop", "Gamefound", "DriveThru RPG"],
    synopsis: "Will you survive Haven City's dark secrets, or will the city claim another victim?",
    type: ["RPG"],
    players: [],
    theme: ["Investigation", "Supernatural", "Urban"],
    mechanics: ["Dice rolling", "Resource management", "Narrative control"],
    features: ["Narrative freedom", "Creative storytelling", "Tough choices", "Short campaigns", "Easy to learn"],
    world: "haven-world",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/games/haven-rpg",
    distributionOrder: 1,
    developers: {
      gameDirector: "Matej Pupačić"
    }
  },
  {
    id: "rika-rpg",
    title: "RIKA: RPG",
    slug: "rika-rpg",
    conceptArt: "/content/images/rika-dindra-zemlja.png",  // Add this line
    description: "A deeply relational space-opera RPG inspired by psychotherapeutic principles.\n\nBy inhabiting radically different alien minds, you'll explore the world—and discover your own character—through their distinct ways of sensing, thinking, and relating.",
    shortDescription: "Therapeutically inspired deeply relational narrative RPG",
    image: "/content/images/rika-dindra-zemlja.png",
    gallery: [],
    status: "Design Phase",
    releaseDate: "Upcoming",
    platforms: ["Tabletop", "Gamefound", "DriveThru RPG"],
    synopsis: "Can you truly understand what it means to be alien—and in doing so, discover who you really are?",
    type: ["RPG"],
    players: [],
    theme: ["Therapeutic", "Space Opera", "Narrative"],
    mechanics: ["Dice rolling", "Guided Imagination", "Narrative control"],
    features: ["Physical Components", "Print-and-Play"],
    world: "the-age-of-rika",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/games/rika-rpg",
    distributionOrder: 3,
    developers: {
      gameDirector: "Nikola Serdarević",
      leadNarrativeDesigner: "Tomislav Furlanis",
      leadSystemDesigner: "Sven Vukelić"
    }
  },
  {
    id: "atomic-horizon-warcaskets",
    title: "Atomic Horizon: Warcaskets",
    slug: "atomic-horizon-warcaskets",
    description: "Deploy as Solar Navy operators in customizable exosuits through a corporate-dominated Solar System at the end of the 21st century.\n\nBreach installations, extract hostages, and suppress insurgencies in tactical co-op missions where survival depends on preparation, positioning, and your squad.\n\nFast when you're winning, brutal when you're tested.",
    shortDescription: "Co-op tactical skirmish game with customizable exosuits and card-driven combat.",
    image: "/content/images/game-atomic-horizon-warcaskets.png",
    gallery: [],
    status: "Design Phase",
    releaseDate: "Upcoming",
    platforms: ["Tabletop", "Gamefound", "Print-and-Play"],
    synopsis: "Will your squad survive the mission when you're outnumbered, outgunned, but not outmaneuvered?",
    type: ["Skirmish"],
    players: ["Co-operative"],
    theme: ["Tactical"],
    mechanics: ["Card-driven Combat", "Dice Rolling", "Modular Scenarios", "Character Customization", "Asymmetric Gameplay"],
    features: ["Deck-building", "Mission-based Play", "Free-to-Play", "Overarching Narrative", "Cooperation"],
    world: "atomic-horizon",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/games/atomic-horizon-warcaskets",
    distributionOrder: 5,
    developers: {
      gameDirector: "Sven Vukelić"
    }
  },
  {
    id: "engines-of-discord",
    title: "Rika: Engines of Discord",
    slug: "engines-of-discord",
    conceptArt: "/content/images/rika-liguni-zeleni.png",  // Add this line
    description: "Your spaceship's systems are spiraling into chaos. Balance the ship's resources and player progression before time, resources, or friendships run out.\n\nA semi-cooperative strategy game where every solved crisis flips into a fresh dilemma.",
    shortDescription: "Multiplayer semi-cooperative event solving and engine building game.",
    image: "/content/images/discord.jpg",
    gallery: [
      "/content/images/EOD.20.01.png",
      "/content/images/EOD.20.01.two.png",
      "/content/images/EOD.20.01.three.png"
    ],
    status: "Development Phase",
    releaseDate: "Upcoming",
    platforms: ["Tabletop", "Gamefound"],
    synopsis: "Will your team manage to solve escalating problems endangering your spaceship?",
    type: ["Strategy"],
    players: ["Semi-Cooperative"],
    theme: ["Puzzle"],
    mechanics: ["Resource management", "Puzzle", "Individual goals", "Engine building", "Semi-cooperative"],
    features: ["Crisis Solving", "Cooperation", "Physical Components"],
    world: "the-age-of-rika",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/games/engines-of-discord",
    distributionOrder: 4,
    developers: {
      gameDirector: "Siniša Družeta",
      leadDesigner: "Tomislav Furlanis"
    }
  }
];

export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id || game.slug === id);
};

export const getGamesByWorld = (worldId: string): Game[] => {
  return games.filter(game => game.world === worldId);
};

export const getFeaturedGames = (): Game[] => {
  return [...games].sort((a, b) => a.distributionOrder - b.distributionOrder);
};

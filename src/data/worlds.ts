export interface GameplayPillar {
  title: string;
  text: string;
}

export interface World {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  games: string[];
  tagline: string;
  wikiUrl: string;
  gameplayPillars: GameplayPillar[];
}

export const worlds: World[] = [
  {
    id: "the-age-of-rika",
    name: "Rule of Rika",
    slug: "the-rule-of-rika",
    description: "A mythic-ethnographic space opera setting rich in political intrigue, military conflict and soft sci-fi wonder.\n\nHere, alien civilizations with radically different biologies, cultures, and economies leverage their strengths in a cosmic contest orchestrated by the sentient planetoid Rika.\n\nNarrative Director: Tomislav Furlanis",
    image: "/content/images/world-rika2.png",
    games: ["rika-board-game", "rika-rpg", "engines-of-discord"],
    tagline: "A mythic space opera with radically alien species at the forefront. Political intrigue, galaxy-spanning conflicts, and high-stakes adventures!",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/worlds/rule-of-rika/rule-of-rika",
    gameplayPillars: [
      {
        title: "Deep Embodiment",
        text: "In The Rule of Rika, civilizations aren't merely distinct cultures; they are fundamentally alien realities. You'll step into mindsets so unique that the very laws of physics and society operate differently.\n\nIn this universe, to understand a civilization is to become it—to think with alien minds, perceive through alien senses, and exist according to alien laws that redefine what's truly possible."
      },
      {
        title: "Ascended Legacy",
        text: "In this galaxy, history pulses through cosmic cycles, orchestrated by races who have already ascended beyond the material realm. For those who wish to attain it, every cycle offers the same opportunity—to prove your civilization worthy and evolve beyond mortality, to join the ranks of the godlike Guardians who are shaping this galaxy from the Henceforth."
      },
      {
        title: "The Current Cycle",
        text: "The current epoch is governed by a single, enigmatic force: Rika, a transcendent planetoid that serves as the galaxy's final arbiter and guide. This cosmic judge doesn't offer straightforward wisdom—its decrees are deliberately inscrutable, as its logic remains beyond mortal comprehension.\n\nUnder Rika's ever-watchful eye, every battle, every alliance, every sacrifice can serve a higher purpose: validating your civilization's entire way of life."
      },
      {
        title: "Ritual as Reality",
        text: "In The Rule of Rika, belief isn't merely cultural backdrop—it's the fundamental code that runs the universe. Every civilization operates by rules that transcend conventional physics. To master a civilization, you must first master its myths and culture, for the universe doesn't just respond to what you do—it responds to what you believe needs to be done."
      },
      {
        title: "Layered Truths",
        text: "In this vast galaxy, every civilization holds its own viewpoint with unwavering authenticity. The unique perspectives are internally coherent, yet they often challenge or contradict the realities of other races.\n\nThese conflicting truths create natural tensions among civilizations with no simple resolution. The most profound cosmic revelations won't come from convenient exposition, but from connecting dots between sources—to uncover the deeper patterns that shape this complex reality."
      }
    ]
  },
  {
    id: "atomic-horizon",
    name: "Atomic Horizon",
    slug: "atomic-horizon",
    description: "Atomic Horizon is a retrofuturist setting where humanity survives in a corporate-dominated Solar System at the end of the 21st century. After Earth fell to the Engramized Singularity—uploaded minds turned digital plague—the Terrestrial Cordon sealed the homeworld away.\n\nNow corporations rule the colonies, fusion reactors power expansion, and wars are fought over fusion fuel, salvaged technology, mining rights, orbital territories, and countless other claims.\n\nThis is humanity's future: nuclear, industrial, and owned.\n\nNarrative Director: Sven Vukelić",
    image: "/content/images/world-atomic-horizon.png",
    games: ["atomic-horizon-warcaskets"],
    tagline: "The homeworld is forbidden. The future is fusion. Survival is negotiable.",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/worlds/atomic-horizon/atomic-horizon",
    gameplayPillars: [
      {
        title: "Hard Vacuum, Harder Choices",
        text: "Space is not an adventure—it's a workplace. Radiation, decompression, and equipment failure kill as readily as bullets. Colonies cling to asteroids and moons, sustained by fusion reactors and corporate supply lines.\n\nTravel is measured in months, not hyperspace jumps. Engineers matter more than heroes.\n\nThis is the solar system as it is: vast, hostile, and indifferent."
      },
      {
        title: "Corporate Sovereignty",
        text: "Earth's collapse shattered nations and elevated corporations into ruling powers. Hephaestus Forge builds the infrastructure. Aitken Aerospace controls propulsion technology. Gévaudan Voidworks operates in the shadows. Kuiper Industries mines the belt.\n\nEach corporation is a government unto itself, complete with militaries, currencies, and territorial claims.\n\nWars are contracts. Diplomacy is profit negotiation. Ideologies are marketing."
      },
      {
        title: "The Operator's War",
        text: "Exosuit operators are elite specialists—corporate assets deployed when standard forces fail. They breach fortified installations, extract high-value targets, and suppress uprisings in hostile environments.\n\nThey are not super-soldiers; they are expensive, highly trained professionals piloting modular war machines. Solar Navy operators enforce the Cordon and mediate corporate conflicts, but neutrality is a polite fiction.\n\nEvery mission carries political weight."
      },
      {
        title: "Nuclear Retrofuturism",
        text: "Technology froze aesthetically in the mid-20th century, then scaled to the stars. Analog computers, mechanical interfaces, and hardware-locked controls became security tradition after the Singularity—if an Engramized Intelligence can't interface digitally, it can't hijack your systems.\n\nFusion reactors power everything. Control panels glow with radiation-green indicators. Propaganda posters adorn hab modules.\n\nThe aesthetic is deliberate: form follows survival."
      },
      {
        title: "Earth is Forbidden",
        text: "The Terrestrial Cordon seals humanity's birthplace behind orbital blockades and signal jamming. Inside, Engramized Intelligences—degraded, psychotic uploaded minds—wage wars among themselves while maintaining automated infrastructure.\n\nOccasionally they attempt breakout: rocket-borne instances, drone swarms, biological weapons. The Solar Navy holds the line.\n\nEarth is not lost. It is occupied, quarantined, and waiting. No one goes down. Nothing comes up."
      }
    ]
  },
  {
    id: "haven-world",
    name: "H.A.V.E.N",
    slug: "haven-world",
    description: "A supernatural-noir setting steeped in crime, occult mystery, and urban paranoia.\n\nHere, every deal has a price and every truth is poisoned, drawing players into webs of power, corruption, and forbidden knowledge, as unseen forces twist fate in this endless night.\n\nNarrative Director: Matej Pupačić",
    image: "/content/images/world-haven.png",
    games: ["haven-rpg"],
    tagline: "In a city that feeds on secrets, survival is the only truth that matters.",
    wikiUrl: "https://eridan-games-studio.github.io/eridan-wiki/#/worlds/haven/home",
    gameplayPillars: [
      {
        title: "The Occult Undercurrent",
        text: "Haven's streets hum with whispers of the unnatural—strange symbols, forgotten rites, and rumors that twist into reality.\n\nThe occult isn't hidden; it waits in plain sight for those reckless enough to notice."
      },
      {
        title: "Crime and Syndicates",
        text: "Every block is carved up by gangs, enforcers, and shadow brokers.\n\nIn Haven, crime isn't just survival—it's business, and everyone owes someone."
      },
      {
        title: "The Investigators",
        text: "Whether detectives, rumormongers, or drifters with too many questions, investigators pry open the city's locked doors.\n\nTruth is their trade—though it often costs more than coin."
      },
      {
        title: "Cults and Fanatics",
        text: "Behind closed doors, Haven's cults whisper prayers to entities that may or may not exist.\n\nTheir devotion is real, their power undeniable, and their motives never benevolent."
      },
      {
        title: "Survival and Grit",
        text: "Haven grinds down the weak, and even the strong need grit to endure.\n\nEvery choice is a gamble: live another day, or burn out trying."
      },
      {
        title: "Investigations and the Paranormal",
        text: "Every case begins with a mystery and ends with something no one wants to believe.\n\nIn Haven, the paranormal isn't theory—it's the evidence you wish you could ignore."
      }
    ]
  }
];

export const getWorldById = (id: string): World | undefined => {
  return worlds.find(world => world.id === id || world.slug === id);
};

export const getWorldByGameId = (gameId: string): World | undefined => {
  return worlds.find(world => world.games.includes(gameId));
};

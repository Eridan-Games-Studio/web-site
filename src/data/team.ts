export interface TeamMember {
  id: string;
  name: string;
  class: string;
  vibe: string;
  avatar: string;
  backstory: string;
  strengths: string[];
  weaknesses: string[];
  proficiencies: string[];
  currentQuest: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "dino",
    name: "Dino Đorić",
    class: "Firestarter",
    vibe: "No pain, no gain. No gain, no glory.",
    avatar: "/content/images/dino2.jpg",
    backstory: "Growing up in a household where card playing was the main social activity, I've been playing cards, board games, and video games my entire life. With a degree in mechanics and over 500 different board games played, the time has come to create games that are perfect both for myself and for the community.",
    strengths: [
      "Analytical mind",
      "Very competitive mindset"
    ],
    weaknesses: [
      "Analysis paralysis",
      "Can end up lost in time"
    ],
    proficiencies: [
      "System engineering",
      "Balancing",
      "Team management",
      "Project coordination"
    ],
    currentQuest: [
      "Eridan's first projects",
      "Developing the Rule of Rika",
      "Gathering great minds to join the studio"
    ]
  },
  {
    id: "tomislav",
    name: "Tomislav Furlanis",
    class: "Awakener",
    vibe: "Doing impossible with the available",
    avatar: "/content/images/slika.tom.jpg",
    backstory: "LOTR and Greg Bear's Eon started my reading adventures at the age of nine and high school sparked my first PC game design attempts. Two decades followed absorbed in Forgotten Realms, TTRPGs, and Extra Credits. Now, armed with scientific research in embodied psychology and narrative theories, doctoral degree in humanities and packed insights from the real and fictional worlds, I stand ready to work on board games. For me they are a profound art uniquely expressing embodied human relations beyond any other medium.",
    strengths: [
      "Experientially divergent",
      "Faith abundant"
    ],
    weaknesses: [
      "Lost in number crunching",
      "Talks too much"
    ],
    proficiencies: [
      "Embodied science approach",
      "Conceptual engineering",
      "Studio Strategy",
      "Team motivation"
    ],
    currentQuest: [
      "Designing narratives",
      "Developing the Rika IP",
      "Studio Strategizing"
    ]
  },
  {
    id: "borjan",
    name: "Borjan Dujmović",
    class: "The Cardivore",
    vibe: "Shuffle the rules, deal the fun!",
    avatar: "/content/images/boki2.jpg",
    backstory: "My journey began as a card game connoisseur deeply immersed in the TCG and LCG genres. This background provided a strong analytical foundation for identifying opportunities to develop truly innovative mechanics. My core focus is the pursuit of interesting gameplay, driven by the insight that strategic depth must be inherently rewarding. I am trying to transition this passion into design work, prioritizing the seamless integration of narrative themes with complex mechanical systems. My aspiration is to become a designer who consistently elevates player engagement through thoughtful, cohesive, and compelling card and strategy game architecture.",
    strengths: [
      "Designing innovative mechanics",
      "Expert knowledge of competitive card ecosystems"
    ],
    weaknesses: [
      "Complexity often exceeds player intuition",
      "Visual design often neglected"
    ],
    proficiencies: [
      "System Innovation",
      "Strategy Mastery",
      "Mechanics Debugging",
      "On-the-Fly Design"
    ],
    currentQuest: [
      "Lead design for the Rule of Rika BGG",
      "Systematically analyzing all strategic and card interactions I can get my hands on",
      "Deconstructing core loops and mechanics"
    ]
  },
  {
    id: "nikola",
    name: "Nikola Serdarević",
    class: "System Therapist",
    vibe: "Emergent Kindness",
    avatar: "/content/images/nikola.jpg",
    backstory: "I am a lifelong lover of science, science fiction, and fantasy who loves to dive into the strange new worlds and ideas of the books, movies, and games of the genre. As an avid TTRPG player and GM, I am able to express myself through the narrative of the story as well as the mathematics of a system. Little did I know the games I played prepared me for a career of systemic and family therapy. Now I am thrilled to bring my professional experience back into the games I love.",
    strengths: [
      "12 years of experience as a systemic family therapist",
      "25 years of experience as a GM in various systems"
    ],
    weaknesses: [
      "Tends to overcomplicate during the design process",
      "Frequent writer's block"
    ],
    proficiencies: [
      "System Design",
      "SF Writing",
      "Mediating Communication"
    ],
    currentQuest: [
      "Game Director on Rika RPG",
      "Exploring the interconnectedness of games, communication, creativity, and therapy",
      "Discovering the alien minds of the Rika Universe"
    ]
  },
  {
    id: "sven",
    name: "Sven Vukelić",
    class: "Architect of Systems and Worlds",
    vibe: "Lawful Neutral in the streets, Chaotic Neutral in the sheets",
    avatar: "/content/images/sven.jpg",
    backstory: "A systems thinker equally at home designing intricate narrative universes and scalable software architectures. With deep experience in a variety of programming languages and frameworks, Sven has developed solutions that balance performance, maintainability, and elegance. His technical career is complemented by a parallel creative pursuit — developing tabletop RPG systems and speculative fiction universes. This duality defines his work: structured precision meets narrative imagination. Sven's driving force is synthesis — merging disciplines, frameworks, and mythologies into cohesive systems where logic and creativity coexist harmoniously.",
    strengths: [
      "Bridges technical engineering with creative worldbuilding",
      "Visualizes and designs robust systems across software, game mechanics, and worldbuilding",
      "Direct communication style that cuts through ambiguity"
    ],
    weaknesses: [
      "Frequently gets lost in the creative or systemic depth of a problem space",
      "Low tolerance for dancing around issues instead of fixing them",
      "Utter refusal to accept own limitations"
    ],
    proficiencies: [
      "Narrative systems design for TTRPGs and interactive worlds",
      "Strategic thinking across organizational and creative structures",
      "A one-man-army with technology - be it web, game or system development",
      "Building teams and helping them work better together",
      "Ethical decision-making around AI usage"
    ],
    currentQuest: [
      "Developing Atomic Horizon: Warcaskets, a tactical co-op tabletop skirmish game",
      "Shaping organizational frameworks at Eridan that merge autonomy, meritocracy, and clarity of purpose",
      "Building systems that enable human empowerment through AI"
    ]
  },
  {
    id: "vuk",
    name: "Vuk Dragičević",
    class: "The Art Knight",
    vibe: "Epic Nostalgist",
    avatar: "/content/images/vuk.jpg",
    backstory: "I am an artist, swordsman, and devoted lover of the '80s, as well as of epic and science fiction. I discovered my passion for drawing at an early age and began designing simple board games during elementary school. Years later, I graduated from the Academy of Fine Arts in Belgrade while pursuing my other passion — two-handed sword fighting — competing in Bohurt and HEMA tournaments. In my previous work at Dazbog Games and Order Chaos Games, I've contributed as an artist, designer, and concept artist. Overall, I love channeling my love of science fiction into creating entirely original races, heroes, and monsters visuals. Here, at Eridan Games, I occuppy the Art Director position for the Rite of Rika Board Game. In alignment with narrative direction, I have developed the canonical visual concepts for the first seven Rule of Rika races.",
    strengths: [
      "Meticulous concept development",
      "Maximum effort and excellent teamwork (with excellent people!)"
    ],
    weaknesses: [
      "If a satisfying concept solution isn't found, inspiration may vanish",
      "Tends to get lost in details"
    ],
    proficiencies: [
      "Visual Storytelling",
      "Character Design",
      "World Visualization",
      "Art Direction"
    ],
    currentQuest: [
      "Art Director for the Rika Board Game",
      "Visualizing the original species and characters of the Rika space opera",
      "Always seeking how to merge classic fantasy with science fiction aesthetics and modern game design"
    ]
  },
  {
    id: "maki",
    name: "Matej Pupačić",
    class: "The World Alchemist",
    vibe: "Neutral Conspirator / Haunted Creative",
    avatar: "/content/images/Maki.jpg",
    backstory: "Discovered TTRPGs back in the early 2000s and has been in love ever since. Has a passion for telling amazing stories in quirky, interesting settings. Tried to write a book or two but decided that TTRPG storytelling is easier. Has been developing RPGs for more than a decade—mostly as passion projects—until recently.",
    strengths: [
      "Storytelling with players in mind",
      "Narrative-over-mechanics approach"
    ],
    weaknesses: [
      "Tends to overthink and complicate",
      "Needs group effort to stay invested"
    ],
    proficiencies: [
      "Improvisation on the spot",
      "Building interesting worlds"
    ],
    currentQuest: [
      "Build HAVEN into the best RPG it can be",
      "Playtest as much as possible",
      "Early ideation of a High Fantasy RPG with tactical combat and modular character creation/progression"
    ]
  },
  {
    id: "matija",
    name: "Matija Dukić",
    class: "Jack of all trades",
    vibe: "...is good!",
    avatar: "/content/images/matijatest.jpg",
    backstory: "(Only) a decade into my board gaming journey, I feel I barely scratched the surface of all the experiences waiting out there. Always on the lookout for new discoveries, innovative mechanics, and interactions that push the boundaries of what's expected. And while I'm at it, might as well try and design a few of my own. With a special interest in translating real-world concepts and themes into game environments.",
    strengths: [
      "Over 300 games' worth of experience",
      "Jack of all trades..."
    ],
    weaknesses: [
      "...master of none",
      "Loves playing devil's advocate a bit too much",
      "Focusing on how a game plays often makes me bad at actually playing it"
    ],
    proficiencies: [
      "Community leader",
      "Spreadsheet aficionado"
    ],
    currentQuest: [
      "Game Director for Rivers of the World",
      "Playtesting anything and everything that gets thrown my way"
    ]
  },
  {
    id: "sinisa",
    name: "Siniša Družeta",
    class: "The General",
    vibe: "Fixing flaws, enhancing quality",
    avatar: "/content/images/sinisa.jpg",
    backstory: "Being a half-centenarian, playing and thinking about board games since childhood makes him a gaming lifer. Otherwise, he is a university professor of fluid mechanics, computational engineering, numerical optimization, and mathematical modeling. A trained analytical mind, he is perpetually interested in finding what makes games come alive, why they work and why they don't.",
    strengths: [
      "Three decades of board games and wargames experience",
      "Proficient in system thinking and analysis"
    ],
    weaknesses: [
      "Storytelling games are not my cup of tea",
      "Rather straightforward in communication"
    ],
    proficiencies: [
      "Quality Assurance Specialist",
      "System Design Analyst",
      "Market Specialist"
    ],
    currentQuest: [
      "Game Director for Rika: Red Alert",
      "Investigating new system relations",
      "Scrutinizing promising games on the market"
    ]
  }
];

export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { worlds as worldsData } from '@/data/worlds';

// Map worlds to their positions: top, bottom-left, bottom-right
const getWorldByPosition = (position: 'top' | 'bottom-left' | 'bottom-right') => {
  const mapping: Record<string, 'top' | 'bottom-left' | 'bottom-right'> = {
    'the-age-of-rika': 'top',
    'haven-world': 'bottom-left',
    'atomic-horizon': 'bottom-right',
  };
  return worldsData.find(w => mapping[w.id] === position);
};

// Pie slice clip-paths for a circle divided into 3 equal sections (120° each)
const pieSlices = {
  // Top slice: 210° to 330° (centered at top)
  top: 'polygon(50% 50%, 6.7% 25%, 25% 6.7%, 50% 0%, 75% 6.7%, 93.3% 25%)',
  // Bottom-left slice: 90° to 210°
  'bottom-left': 'polygon(50% 50%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%)',
  // Bottom-right slice: 330° to 90°
  'bottom-right': 'polygon(50% 50%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%)',
};

// Noir-specific content for Haven hover state
const noirContent = {
  title: "H.A.V.E.N",
  tagline: "In a city that feeds on secrets, survival is the only truth that matters.",
  pillars: [
    { position: 'top', title: "The Occult Undercurrent", text: "Strange symbols, forgotten rites, and rumors that twist into reality." },
    { position: 'bottom-left', title: "Crime & Syndicates", text: "Every block is carved up by gangs, enforcers, and shadow brokers." },
    { position: 'bottom-right', title: "Survival & Grit", text: "Haven grinds down the weak. Every choice is a gamble." },
  ]
};

// Rika-specific content for Rika hover state
const rikaContent = {
  title: "Rule of Rika",
  tagline: "A mythic space opera with radically alien species at the forefront.",
  pillars: [
    { position: 'top', title: "Deep Embodiment", text: "Civilizations aren't merely distinct cultures; they are fundamentally alien realities." },
    { position: 'bottom-left', title: "Ascended Legacy", text: "Every cycle offers the opportunity to prove your civilization worthy and evolve beyond mortality." },
    { position: 'bottom-right', title: "Ritual as Reality", text: "Belief isn't cultural backdrop—it's the fundamental code that runs the universe." },
  ]
};

// Atomic Horizon-specific content for Atomic hover state
const atomicContent = {
  title: "Atomic Horizon",
  tagline: "The homeworld is forbidden. The future is fusion. Survival is negotiable.",
  pillars: [
    { position: 'top', title: "Corporate Sovereignty", text: "Earth's collapse elevated corporations into ruling powers. Wars are contracts, and ideologies are marketing." },
    { position: 'bottom-left', title: "Nuclear Retrofuturism", text: "Analog computers and mechanical interfaces are the only defense against digital plagues." },
    { position: 'bottom-right', title: "Earth is Forbidden", text: "The homeworld is sealed behind a blockade, quarantined from the psychotic minds that now own it." },
  ]
};

interface PieSectionProps {
  world: typeof worldsData[0];
  position: 'top' | 'bottom-left' | 'bottom-right';
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  hoveredWorld?: string | null;
  onTouchActivate?: () => void;
}

const PieSection = ({ world, position, onHoverStart, onHoverEnd, hoveredWorld, onTouchActivate }: PieSectionProps) => {
  const clipPath = pieSlices[position];
  const isHavenHovered = hoveredWorld === 'haven-world';
  const isRikaHovered = hoveredWorld === 'the-age-of-rika';
  const isAtomicHovered = hoveredWorld === 'atomic-horizon';
  const isThisHaven = world.id === 'haven-world';
  const isThisRika = world.id === 'the-age-of-rika';
  const isThisAtomic = world.id === 'atomic-horizon';

  // Text positioning for each slice - centered in the slice area
  const textPositions = {
    top: 'top-[15%] left-1/2 -translate-x-1/2 w-[60%]',
    'bottom-left': 'top-[55%] left-[5%] w-[40%]',
    'bottom-right': 'top-[55%] right-[5%] w-[40%]',
  };

  // Get themed content for this position
  const noirPillar = noirContent.pillars.find(p => p.position === position);
  const rikaPillar = rikaContent.pillars.find(p => p.position === position);
  const atomicPillar = atomicContent.pillars.find(p => p.position === position);

  // Determine what text to show - hovered slice always shows its original text
  const showNoirContent = isHavenHovered && !isThisHaven;
  const showRikaContent = isRikaHovered && !isThisRika;
  const showAtomicContent = isAtomicHovered && !isThisAtomic;

  // Handle touch for mobile - activate on touch, navigate on second touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (hoveredWorld !== world.id) {
      e.preventDefault();
      onTouchActivate?.();
    }
  };

  return (
    <Link
      to="/worlds"
      className="absolute inset-0 group focus-visible:outline-none touch-manipulation"
      style={{ clipPath }}
      aria-label={`Explore ${world.name} world`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        // On mobile, first touch activates, second touch navigates
        if ('ontouchstart' in window && hoveredWorld !== world.id) {
          e.preventDefault();
          onTouchActivate?.();
        }
      }}
    >
      <motion.div
        className={`absolute inset-0 overflow-hidden transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-inset ${isHavenHovered || isRikaHovered || isAtomicHovered ? 'bg-card/60' : 'bg-card/80 hover:bg-card'
          }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Hover glow effect */}
        <div className={`absolute inset-0 transition-colors duration-500 ${isHavenHovered ? 'bg-purple-500/10' :
          isRikaHovered ? 'bg-cyan-500/10' :
            isAtomicHovered ? 'bg-amber-500/10' :
              'bg-primary/0 group-hover:bg-primary/10 group-focus-visible:bg-primary/10'
          }`} />

        {/* World name and description */}
        <div className={`absolute ${textPositions[position]} text-center z-10 p-2 overflow-hidden transition-opacity duration-300`}>
          {showNoirContent && noirPillar ? (
            <>
              <h3 className="font-fantasy text-base sm:text-lg lg:text-xl font-semibold text-purple-300 transition-colors duration-300 sm:mb-2 break-words">
                {noirPillar.title}
              </h3>
              <p className="hidden sm:block text-purple-200/70 text-xs sm:text-sm leading-relaxed line-clamp-3 break-words">
                {noirPillar.text}
              </p>
            </>
          ) : showRikaContent && rikaPillar ? (
            <>
              <h3 className="font-fantasy text-base sm:text-lg lg:text-xl font-semibold text-cyan-300 transition-colors duration-300 sm:mb-2 break-words">
                {rikaPillar.title}
              </h3>
              <p className="hidden sm:block text-cyan-200/70 text-xs sm:text-sm leading-relaxed line-clamp-3 break-words">
                {rikaPillar.text}
              </p>
            </>
          ) : showAtomicContent && atomicPillar ? (
            <>
              <h3 className="font-fantasy text-base sm:text-lg lg:text-xl font-semibold text-amber-300 transition-colors duration-300 sm:mb-2 break-words">
                {atomicPillar.title}
              </h3>
              <p className="hidden sm:block text-amber-200/70 text-xs sm:text-sm leading-relaxed line-clamp-3 break-words">
                {atomicPillar.text}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-fantasy text-base sm:text-lg lg:text-xl font-semibold text-foreground group-hover:text-primary group-focus-visible:text-primary transition-colors duration-300 sm:mb-2 break-words">
                {world.name}
              </h3>
              <p className="hidden sm:block text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3 break-words">
                {world.tagline}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export const WorldsSection = () => {
  const [hoveredWorld, setHoveredWorld] = useState<string | null>(null);

  const topWorld = getWorldByPosition('top');
  const bottomLeftWorld = getWorldByPosition('bottom-left');
  const bottomRightWorld = getWorldByPosition('bottom-right');

  if (!topWorld || !bottomLeftWorld || !bottomRightWorld) {
    return null;
  }

  // Background image based on hovered world
  const backgroundImage =
    hoveredWorld === 'haven-world' ? '/content/images/world.noir.jpg' :
      hoveredWorld === 'the-age-of-rika' ? '/content/images/rika-liguni-zeleni.png' :
        hoveredWorld === 'atomic-horizon' ? '/content/images/world-atomic-horizon.png' :
          '/content/images/planet.jpg';

  return (
    <section id="worlds" className="relative py-16 sm:py-24">
      {/* Background accent */}
      <div className="absolute inset-0 bg-cosmic-radial opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-fantasy text-4xl sm:text-5xl font-semibold mb-4 [text-wrap:balance]">
            Our <span className="text-cosmic-gradient">Worlds</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We build authentic, boldly contrasted worlds, where every layer invites discovery.
          </p>
        </motion.div>

        {/* Circular Pie Layout */}
        <div className="relative w-full aspect-square max-w-xl mx-auto rounded-full overflow-hidden border-2 border-primary/30">
          {/* Background image - changes on hover */}
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none transition-opacity duration-300"
          />

          {/* Top slice - Rule of Rika */}
          <PieSection
            world={topWorld}
            position="top"
            onHoverStart={() => setHoveredWorld(topWorld.id)}
            onHoverEnd={() => setHoveredWorld(null)}
            hoveredWorld={hoveredWorld}
            onTouchActivate={() => setHoveredWorld(topWorld.id)}
          />

          {/* Bottom-left slice - Haven */}
          <PieSection
            world={bottomLeftWorld}
            position="bottom-left"
            onHoverStart={() => setHoveredWorld(bottomLeftWorld.id)}
            onHoverEnd={() => setHoveredWorld(null)}
            hoveredWorld={hoveredWorld}
            onTouchActivate={() => setHoveredWorld(bottomLeftWorld.id)}
          />

          {/* Bottom-right slice - Atomic Horizon */}
          <PieSection
            world={bottomRightWorld}
            position="bottom-right"
            onHoverStart={() => setHoveredWorld(bottomRightWorld.id)}
            onHoverEnd={() => setHoveredWorld(null)}
            hoveredWorld={hoveredWorld}
            onTouchActivate={() => setHoveredWorld(bottomRightWorld.id)}
          />

          {/* Center point decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 z-20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

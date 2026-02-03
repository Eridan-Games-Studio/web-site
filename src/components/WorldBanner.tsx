import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pageUrl?: string;
  wikiUrl?: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  games: Game[];
}

interface WorldBannerProps {
  world: World;
  index: number;
}

export const WorldBanner = ({ world, index }: WorldBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (game: Game) => {
    // Toggle: if same game clicked, close it; otherwise open new one
    setSelectedGame(prev => prev?.id === game.id ? null : game);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      {/* World Banner - Full Width Horizontal */}
      <div
        className="relative overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image */}
        <div className="relative h-32 sm:h-40 lg:h-48 overflow-hidden">
          <img
            src={world.imageUrl}
            alt={world.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* World Info - Positioned on top */}
        <div className="absolute inset-0 flex items-center px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <h3 className="font-fantasy text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground glow-text group-hover:text-primary transition-colors duration-300">
              {world.name}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 max-w-xl line-clamp-2">
              {world.description}
            </p>
          </div>
          
          {/* Games count indicator */}
          <div className="flex-shrink-0 flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300">
            <span className="text-sm hidden sm:inline">
              {world.games.length} {world.games.length === 1 ? 'Game' : 'Games'}
            </span>
            <motion.span
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl"
            >
              ▼
            </motion.span>
          </div>
        </div>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Games Dropdown - appears on hover */}
      <AnimatePresence>
        {isHovered && world.games.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-background/80 backdrop-blur-sm border-b border-primary/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap gap-3">
                {world.games.map((game) => (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-4 py-2 rounded-lg border transition-all duration-300
                      ${selectedGame?.id === game.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30' 
                        : 'bg-card/50 text-foreground border-border hover:border-primary/50 hover:bg-card'
                      }
                    `}
                  >
                    <span className="font-medium text-sm sm:text-base">{game.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Game Detail Panel */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm border-b border-primary/20 px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row gap-6 max-w-5xl">
                {/* Game Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-full sm:w-48 lg:w-64 aspect-video rounded-lg overflow-hidden border-glow">
                    <img
                      src={selectedGame.imageUrl}
                      alt={selectedGame.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-fantasy text-xl sm:text-2xl font-semibold text-foreground glow-text">
                      {selectedGame.title}
                    </h4>
                    <button
                      onClick={() => setSelectedGame(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-xl"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
                    {selectedGame.description}
                  </p>

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {selectedGame.pageUrl && (
                      <Link
                        to={selectedGame.pageUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <span>View Full Page</span>
                        <span>→</span>
                      </Link>
                    )}
                    {selectedGame.wikiUrl && (
                      <a
                        href={selectedGame.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-primary/50 text-foreground rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                      >
                        <span>Wiki</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

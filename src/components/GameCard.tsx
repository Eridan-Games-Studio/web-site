import { motion } from 'framer-motion';

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'In Development' | 'Coming Soon' | 'Released' | 'Early Access';
  platforms: string[];
  tags: string[];
  worldId?: string;
}

interface GameCardProps {
  game: Game;
  index: number;
}

const statusStyles = {
  'In Development': 'bg-secondary/20 text-secondary border-secondary/40 animate-pulse-glow',
  'Coming Soon': 'bg-primary/20 text-primary border-primary/40',
  'Released': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Early Access': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
};

const platformIcons: Record<string, string> = {
  PC: '🖥️',
  Steam: '🎮',
  Mobile: '📱',
  Web: '🌐',
  Console: '🎯',
  Tabletop: '🎲',
};

export const GameCard = ({ game, index }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group cosmic-card overflow-hidden cursor-pointer transition-all duration-300 hover:glow-purple"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full border ${statusStyles[game.status]}`}>
            {game.status}
          </span>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-fantasy text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {game.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {game.description}
        </p>

        {/* Platforms */}
        <div className="flex items-center gap-2 mb-3">
          {game.platforms.map((platform) => (
            <span
              key={platform}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-muted/50 rounded-md border border-border/50"
              title={platform}
            >
              <span>{platformIcons[platform] || '🎮'}</span>
              <span className="hidden sm:inline">{platform}</span>
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs text-muted-foreground bg-primary/10 rounded-full border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-2 border-t border-border/30">
        <span className="text-sm text-primary font-medium group-hover:text-secondary transition-colors duration-300 flex items-center gap-2">
          Learn more
          <motion.span
            className="inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
          >
            →
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
};

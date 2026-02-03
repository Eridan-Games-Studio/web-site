import { motion } from 'framer-motion';

export interface World {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  gamesCount: number;
}

interface WorldCardProps {
  world: World;
  index: number;
}

export const WorldCard = ({ world, index }: WorldCardProps) => {
  return (
    <motion.a
      href={`#world-${world.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative block overflow-hidden rounded-2xl border-glow cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={world.imageUrl}
          alt={world.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-fantasy text-2xl sm:text-3xl font-semibold text-foreground mb-2 glow-text group-hover:text-primary transition-colors duration-300">
              {world.name}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-2 max-w-md">
              {world.description}
            </p>
          </div>
          
          {/* Games count badge */}
          <div className="flex-shrink-0">
            <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
              <span className="text-sm font-medium text-primary-foreground">
                {world.gamesCount} {world.gamesCount === 1 ? 'Game' : 'Games'}
              </span>
            </div>
          </div>
        </div>

        {/* Explore indicator */}
        <motion.div
          className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <span className="text-sm font-medium">Explore World</span>
          <span className="text-lg">→</span>
        </motion.div>
      </div>

      {/* Corner glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.a>
  );
};

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TeamMember } from '@/data/team';

interface CharacterSheetProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterSheet = ({ member, isOpen, onClose }: CharacterSheetProps) => {
  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container - centered with flexbox */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cosmic-card relative overflow-hidden rounded-xl border border-primary/30 bg-background/95 p-6 shadow-2xl sm:p-8">
                {/* Starfield effect in background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>

                {/* Content */}
                <div className="relative">
                  {/* Header */}
                  <div className="mb-6 flex items-start gap-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-3 border-primary/50 sm:h-32 sm:w-32">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 pt-2">
                      <h2 className="font-fantasy text-2xl font-semibold text-foreground sm:text-3xl">
                        {member.name}
                      </h2>
                      <p className="mt-1 text-lg font-medium text-primary">{member.class}</p>
                      <p className="mt-2 text-sm italic text-muted-foreground">"{member.vibe}"</p>
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="mb-6">
                    <h3 className="mb-2 font-fantasy text-lg font-semibold text-foreground">Backstory</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{member.backstory}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Strengths */}
                    <div className="rounded-lg border border-cosmic-cyan/30 bg-cosmic-cyan/5 p-4">
                      <h4 className="mb-2 font-medium text-cosmic-cyan">Strengths</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {member.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 text-cosmic-cyan">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4">
                      <h4 className="mb-2 font-medium text-red-400">Weaknesses</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {member.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 text-red-400">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Proficiencies */}
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <h4 className="mb-2 font-medium text-primary">Proficiencies</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {member.proficiencies.map((proficiency, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 text-primary">•</span>
                            <span>{proficiency}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Current Quest */}
                    <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                      <h4 className="mb-2 font-medium text-secondary">Current Quest</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {member.currentQuest.map((quest, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 text-secondary">•</span>
                            <span>{quest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

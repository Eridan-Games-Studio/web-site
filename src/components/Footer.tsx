import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/30">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary/30 flex items-center justify-center">
              <img src="/content/images/eridan-logo-vuk.png" alt="Eridan Games" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-fantasy text-lg">Eridan Games</span>
          </Link>

          {/* Navigation links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" aria-label="Footer navigation">
            <Link to="/" className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              Home
            </Link>
            <Link to="/games" className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              Games
            </Link>
            <Link to="/worlds" className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              Worlds
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              About
            </Link>
            <span className="hidden sm:inline text-border" aria-hidden="true">|</span>
            <a
              href="https://discord.gg/Xtf2ehPPt4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Discord
            </a>
            <a
              href="https://eridan-games-studio.github.io/eridan-wiki/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Wiki
            </a>
            <a
              href="https://www.youtube.com/@EridanGamesStudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              YouTube
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eridan Games
          </p>
        </div>
      </div>
    </footer>
  );
};

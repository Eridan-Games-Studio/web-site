import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { WorldsSection } from '@/components/WorldsSection';
import { GamesSection } from '@/components/GamesSection';
import { CommunitySection } from '@/components/CommunitySection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Animated starfield background */}
      <Starfield />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main>
        {/* Full-screen immersive hero */}
        <HeroSection />
        
        {/* Worlds section with integrated games */}
        <WorldsSection />
        
        {/* Community section */}
        <CommunitySection />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

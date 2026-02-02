import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Starfield />
      <Navigation />

      <main className="relative flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-fantasy text-8xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! This world hasn't been discovered yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <span>←</span>
            <span>Return to Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

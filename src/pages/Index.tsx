
import { useState, useEffect } from 'react';
import { ArrowRight, Phone, Mail, MapPin, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-stone-100">
      <Navigation />
      <main>
        <Hero scrollY={scrollY} />
        <Services />
        <Portfolio />
        <About />
        <Contact />
      </main>
    </div>
  );
};

export default Index;

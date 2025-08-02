
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import { getHeroImages, getInteriorImages } from '@/lib/imageUtils';

interface HeroProps {
  scrollY: number;
}

const Hero = ({ scrollY }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Try to load hero images first, fallback to interior images
  const [carouselImages, setCarouselImages] = useState<string[]>(getInteriorImages());
  
  useEffect(() => {
    // First try hero images, if they fail to load, use interior images
    const heroImages = getHeroImages();
    const checkImageExists = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    // Check if hero images exist
    Promise.all(heroImages.map(checkImageExists)).then((results) => {
      const hasHeroImages = results.some(exists => exists);
      if (hasHeroImages) {
        setCarouselImages(heroImages);
      } else {
        // Use existing interior images as fallback
        setCarouselImages(getInteriorImages());
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" role="banner" aria-label="Hero section">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url("${image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `translateY(${scrollY * 0.3}px)`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-stone-900/40 z-10" />
      
      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards]">
          Remap - Transform Your
          <span className="block text-amber-400">Living Space</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-stone-200 animate-fade-in opacity-0 [animation-delay:1s] [animation-fill-mode:forwards]">
          Professional interior design services creating beautiful, functional spaces. Specializing in residential and commercial design with over 10 years of experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0 [animation-delay:1.5s] [animation-fill-mode:forwards]">
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 group"
            onClick={() => scrollToSection('portfolio')}
          >
            View Our Work
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white text-black bg-white hover:bg-black hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => scrollToSection('contact')}
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white opacity-70" />
      </div>
    </section>
  );
};

export default Hero;


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MapPin, Star } from 'lucide-react';
import { GetQuoteDialog } from './GetQuoteDialog';
import CustomerReviewDialog from './CustomerReviewDialog';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <MapPin className="text-amber-600" size={28} />
            <h1 className="text-2xl font-bold text-stone-800 tracking-wide">
              <span className="text-amber-600">Remap</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-stone-700 hover:text-amber-600 transition-colors duration-300 font-medium relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <CustomerReviewDialog>
              <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105">
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            </CustomerReviewDialog>
            <GetQuoteDialog>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full transition-all duration-300 hover:scale-105">
                Get Quote
              </Button>
            </GetQuoteDialog>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-700"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 p-4 shadow-lg animate-fade-in">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-3 text-stone-700 hover:text-amber-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <CustomerReviewDialog>
              <Button variant="outline" className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-full">
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            </CustomerReviewDialog>
            <GetQuoteDialog>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                Get Quote
              </Button>
            </GetQuoteDialog>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

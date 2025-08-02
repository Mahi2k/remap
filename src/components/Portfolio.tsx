
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { getImagePath, getFallbackImage, IMAGE_CATEGORIES, PORTFOLIO_SUBCATEGORIES } from '@/lib/imageUtils';
import { getPortfolioImagesFromFolders, filterPortfolioImages, type PortfolioImage } from '@/lib/portfolioImageLoader';

type PortfolioItem = Tables<'portfolio_items'>;

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [folderImages, setFolderImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get portfolio image path
  const getPortfolioImagePath = (project: PortfolioItem): string => {
    if (project.image_url) {
      // If it's already a full URL or starts with /, use as-is
      if (project.image_url.startsWith('http') || project.image_url.startsWith('/image-collection')) {
        return project.image_url;
      }
      
      // Determine subcategory based on project category
      let subcategory = '';
      if (project.category) {
        switch (project.category.toLowerCase()) {
          case 'living':
          case 'kitchen':
          case 'bathroom':
            subcategory = PORTFOLIO_SUBCATEGORIES.RESIDENTIAL;
            break;
          case 'bedroom':
            subcategory = PORTFOLIO_SUBCATEGORIES.BEDROOMS;
            break;
          case 'office':
          case 'commercial':
            subcategory = PORTFOLIO_SUBCATEGORIES.COMMERCIAL;
            break;
          case 'renovation':
          case 'before-after':
            subcategory = PORTFOLIO_SUBCATEGORIES.RENOVATION;
            break;
          default:
            subcategory = PORTFOLIO_SUBCATEGORIES.RESIDENTIAL;
        }
      }
      
      return getImagePath(IMAGE_CATEGORIES.PORTFOLIO, project.image_url, subcategory);
    }
    
    return getFallbackImage(IMAGE_CATEGORIES.PORTFOLIO);
  };

  useEffect(() => {
    const loadFolderImages = () => {
      // Load images from GitHub folders only
      const images = getPortfolioImagesFromFolders();
      setFolderImages(images);
    };

    const loadPortfolio = async () => {
      setLoading(true);
      loadFolderImages();
      setLoading(false);
    };

    loadPortfolio();
  }, []);

  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'living', label: 'Living Spaces' },
    { key: 'bedroom', label: 'Bedrooms' },
    { key: 'kitchen', label: 'Kitchens' },
    { key: 'bathroom', label: 'Bathrooms' },
    { key: 'office', label: 'Offices' }
  ];

  // Only use folder images from GitHub
  const filteredFolderImages = filterPortfolioImages(folderImages, activeFilter);

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Our Portfolio
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8">
            Explore our recent projects and see how we transform spaces into beautiful, 
            functional environments that exceed expectations.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-stone-600">Loading portfolio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Only Folder Images from GitHub */}
            {filteredFolderImages.map((image, index) => (
              <Card 
                key={`folder-${image.id}`}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-none animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.imagePath}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                    <p className="text-stone-200">{image.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;

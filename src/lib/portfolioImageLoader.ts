// Dynamic portfolio image loader that syncs with GitHub folders
import { IMAGE_CATEGORIES, PORTFOLIO_SUBCATEGORIES } from './imageUtils';

export interface PortfolioImage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  imagePath: string;
  description?: string;
}

// Known image files in each category (update this as you add more images)
const PORTFOLIO_IMAGES = {
  [PORTFOLIO_SUBCATEGORIES.BEDROOMS]: [
    'ANU ROOM 1.jpg',
    'ANU ROOM 2.jpg', 
    'ANU ROOM 3.jpg',
    'ANU ROOM 4.jpg',
    'ANU ROOM 5.jpg',
    'ANU ROOM 6.jpg',
    'ANU ROOM 7.jpg',
    'ANU ROOM 8.jpg',
    'ANU ROOM 9.jpg',
    'ANU ROOM 10.png',
    'ANU ROOM 11.jpg'
  ],
  [PORTFOLIO_SUBCATEGORIES.LIVING_SPACES]: [
    // Add living space images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.KITCHENS]: [
    // Add kitchen images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.BATHROOMS]: [
    // Add bathroom images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.OFFICES]: [
    // Add office images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.RESIDENTIAL]: [
    // Add residential images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.COMMERCIAL]: [
    // Add commercial images here when available
  ],
  [PORTFOLIO_SUBCATEGORIES.RENOVATION]: [
    // Add renovation images here when available
  ]
};

/**
 * Generate portfolio items from folder structure
 */
export function getPortfolioImagesFromFolders(): PortfolioImage[] {
  const portfolioItems: PortfolioImage[] = [];

  Object.entries(PORTFOLIO_IMAGES).forEach(([subcategory, imageFiles]) => {
    imageFiles.forEach((filename, index) => {
      const imagePath = `/image-collection/${IMAGE_CATEGORIES.PORTFOLIO}/${subcategory}/${filename}`;
      
      // Generate title from filename
      const title = filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ')     // Replace dashes/underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words

      // Map subcategory to main category
      let category = 'bedroom';
      switch (subcategory) {
        case PORTFOLIO_SUBCATEGORIES.LIVING_SPACES:
          category = 'living';
          break;
        case PORTFOLIO_SUBCATEGORIES.KITCHENS:
          category = 'kitchen';
          break;
        case PORTFOLIO_SUBCATEGORIES.BATHROOMS:
          category = 'bathroom';
          break;
        case PORTFOLIO_SUBCATEGORIES.OFFICES:
          category = 'office';
          break;
        case PORTFOLIO_SUBCATEGORIES.BEDROOMS:
          category = 'bedroom';
          break;
        case PORTFOLIO_SUBCATEGORIES.RESIDENTIAL:
          category = 'living';
          break;
        case PORTFOLIO_SUBCATEGORIES.COMMERCIAL:
          category = 'office';
          break;
        case PORTFOLIO_SUBCATEGORIES.RENOVATION:
          category = 'renovation';
          break;
      }

      portfolioItems.push({
        id: `${subcategory}-${index}`,
        title,
        category,
        subcategory,
        imagePath,
        description: `Beautiful ${category} design showcase`
      });
    });
  });

  return portfolioItems;
}

/**
 * Check if an image exists by attempting to load it
 */
export function checkImageExists(imagePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}

/**
 * Filter portfolio images by category
 */
export function filterPortfolioImages(images: PortfolioImage[], category: string): PortfolioImage[] {
  if (category === 'all') return images;
  return images.filter(image => image.category === category);
}
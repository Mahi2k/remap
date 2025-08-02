// Image path utilities for organized image management

export const IMAGE_CATEGORIES = {
  HERO: 'hero',
  INTERIORS: 'interiors', 
  TEAM: 'team',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  REVIEWS: 'reviews'
} as const;

export const PORTFOLIO_SUBCATEGORIES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial', 
  RENOVATION: 'renovation',
  BEDROOMS: 'bedrooms'
} as const;

/**
 * Get image path from the organized image-collection folder
 */
export function getImagePath(category: string, filename: string, subcategory?: string): string {
  const basePath = '/image-collection';
  
  if (subcategory) {
    return `${basePath}/${category}/${subcategory}/${filename}`;
  }
  
  return `${basePath}/${category}/${filename}`;
}

/**
 * Get fallback image for missing images
 */
export function getFallbackImage(category: string): string {
  const fallbacks = {
    [IMAGE_CATEGORIES.HERO]: '/placeholder.svg',
    [IMAGE_CATEGORIES.INTERIORS]: '/placeholder.svg',
    [IMAGE_CATEGORIES.TEAM]: '/placeholder.svg',
    [IMAGE_CATEGORIES.SERVICES]: '/placeholder.svg',
    [IMAGE_CATEGORIES.PORTFOLIO]: '/placeholder.svg',
    [IMAGE_CATEGORIES.REVIEWS]: '/placeholder.svg'
  };
  
  return fallbacks[category] || '/placeholder.svg';
}

/**
 * Hero section default images
 */
export function getHeroImages(): string[] {
  return [
    getImagePath(IMAGE_CATEGORIES.HERO, 'hero-01.jpg'),
    getImagePath(IMAGE_CATEGORIES.HERO, 'hero-02.jpg'), 
    getImagePath(IMAGE_CATEGORIES.HERO, 'hero-03.jpg'),
    getImagePath(IMAGE_CATEGORIES.HERO, 'hero-04.jpg'),
    getImagePath(IMAGE_CATEGORIES.HERO, 'hero-05.jpg')
  ];
}

/**
 * Get interior showcase images (fallback for hero if no hero images)
 */
export function getInteriorImages(): string[] {
  return [
    getImagePath(IMAGE_CATEGORIES.INTERIORS, 'living-room.jpg'),
    getImagePath(IMAGE_CATEGORIES.INTERIORS, 'bedroom.jpg'),
    getImagePath(IMAGE_CATEGORIES.INTERIORS, 'kitchen.jpg'),
    getImagePath(IMAGE_CATEGORIES.INTERIORS, 'apartment.jpg'),
    getImagePath(IMAGE_CATEGORIES.INTERIORS, 'dining-room.jpg')
  ];
}
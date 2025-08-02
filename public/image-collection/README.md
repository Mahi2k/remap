# Image Collection Organization

This folder contains all website images organized by category for better management.

## Folder Structure

```
image-collection/
├── hero/           # Hero section carousel images
├── interiors/      # Interior showcase images (existing)
├── team/           # Team and about section images
├── services/       # Service-specific images
├── portfolio/      # Portfolio project images
│   ├── residential/
│   ├── commercial/
│   └── renovation/
└── reviews/        # Customer review and testimonial images
```

## Image Naming Conventions

### Hero Images
- `hero-01.jpg`, `hero-02.jpg`, etc.
- High resolution (1920x1080+), optimized for web

### Interior Images
- Current files: `living-room.jpg`, `bedroom.jpg`, `kitchen.jpg`, `apartment.jpg`, `dining-room.jpg`
- Keep existing names for compatibility

### Portfolio Images  
- `project-01.jpg`, `project-02.jpg` or descriptive names
- Subfolders: residential/, commercial/, renovation/

### Service Images
- `interior-design.jpg`, `renovation.jpg`, `consultation.jpg`, etc.

### Team Images
- `team-photo.jpg`, `about-team.jpg`

### Review Images
- `customer-01.jpg`, `review-project-01.jpg`

## Usage in Code

The website now uses the `imageUtils.ts` utility for organized image paths:

```typescript
import { getImagePath, IMAGE_CATEGORIES } from '@/lib/imageUtils';

// Get hero image
const heroImage = getImagePath(IMAGE_CATEGORIES.HERO, 'hero-01.jpg');

// Get portfolio image with subcategory
const portfolioImage = getImagePath(IMAGE_CATEGORIES.PORTFOLIO, 'project-01.jpg', 'residential');
```

## Image Optimization Guidelines

- **File Size**: Keep under 500KB for hero images, 300KB for others
- **Format**: Use WebP when possible, JPG as fallback
- **Resolution**: Minimum 800px width, scale up for hero images
- **Compression**: Balance quality vs file size for web performance

## Adding New Images

1. Place images in the appropriate category folder
2. Follow naming conventions
3. Optimize images for web (compress, resize)
4. Update code references if needed using imageUtils.ts helpers
-- Insert additional portfolio items
INSERT INTO public.portfolio_items (title, description, image_url, category, is_featured, sort_order) VALUES 
  ('Modern Living Room Design', 'Contemporary living space with minimalist aesthetics and warm lighting', '/placeholder.svg', 'Residential', true, 1),
  ('Luxury Kitchen Renovation', 'Complete kitchen transformation with premium finishes and smart storage', '/placeholder.svg', 'Kitchen', true, 2),
  ('Office Space Makeover', 'Professional workspace design promoting productivity and creativity', '/placeholder.svg', 'Commercial', false, 3),
  ('Master Bedroom Suite', 'Elegant bedroom design with custom built-ins and luxury materials', '/placeholder.svg', 'Residential', true, 4),
  ('Restaurant Interior', 'Sophisticated dining space with ambient lighting and custom furniture', '/placeholder.svg', 'Commercial', false, 5),
  ('Bathroom Renovation', 'Spa-like bathroom with modern fixtures and natural stone accents', '/placeholder.svg', 'Bathroom', false, 6);

-- Update services with more detailed descriptions and icon names
UPDATE public.services SET 
  description = 'Transform your space with our comprehensive interior design services. From concept development to final installation, we create beautiful, functional environments tailored to your lifestyle.',
  icon_name = 'Palette'
WHERE title = 'Interior Design';

UPDATE public.services SET 
  description = 'Maximize your space potential with our expert space planning services. We analyze flow, functionality, and aesthetics to create optimal layouts for any environment.',
  icon_name = 'Layout'
WHERE title = 'Space Planning';

UPDATE public.services SET 
  description = 'Complete renovation services from structural changes to finishing touches. Our experienced team manages every aspect of your project with precision and care.',
  icon_name = 'Hammer'
WHERE title = 'Renovation';

UPDATE public.services SET 
  description = 'Professional design consultation to help you make informed decisions about your space. Get expert advice on materials, colors, layouts, and design direction.',
  icon_name = 'MessageCircle'
WHERE title = 'Consultation';

-- Add more services
INSERT INTO public.services (title, description, icon_name, sort_order) VALUES 
  ('Custom Furniture', 'Bespoke furniture design and manufacturing to perfectly fit your space and style preferences', 'Armchair', 5),
  ('Lighting Design', 'Comprehensive lighting solutions that enhance ambiance, functionality, and aesthetic appeal', 'Lightbulb', 6);

-- Update hero content with more engaging description
UPDATE public.hero_content SET 
  description = 'Award-winning interior design and renovation services that transform ordinary spaces into extraordinary environments. Our team of expert designers brings creativity, functionality, and style together to create spaces that truly reflect your vision and enhance your daily life.',
  background_image_url = '/placeholder.svg'
WHERE is_active = true;

-- Update about content with more comprehensive information
UPDATE public.about_content SET 
  description = 'Remap Design Studio has been transforming spaces across the region for over a decade. Our passionate team of interior designers, architects, and craftsmen work collaboratively to bring your vision to life. We believe that great design should be both beautiful and functional, creating environments that not only look stunning but also enhance the way you live and work. From residential homes to commercial spaces, we approach each project with fresh eyes, innovative solutions, and meticulous attention to detail. Our commitment to quality, sustainability, and client satisfaction has earned us recognition as one of the leading design studios in the industry.',
  team_image_url = '/placeholder.svg'
WHERE is_active = true;
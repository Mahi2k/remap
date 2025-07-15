-- Add more portfolio items to ensure at least 3 per category
INSERT INTO public.portfolio_items (title, description, image_url, category, is_featured, sort_order) VALUES 
  -- Living Spaces (need 1 more)
  ('Contemporary Loft Living', 'Open-plan living space with industrial touches and modern comfort', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'living', false, 7),
  
  -- Bedrooms (need 2 more)  
  ('Minimalist Zen Bedroom', 'Serene bedroom design with clean lines and natural materials', 'https://images.unsplash.com/photo-1631889993959-41b4e9c19697?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'bedroom', true, 8),
  ('Luxurious Master Suite', 'Opulent bedroom with custom furniture and rich textures', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'bedroom', false, 9),
  
  -- Kitchens (need 2 more)
  ('Modern Farmhouse Kitchen', 'Rustic charm meets contemporary functionality', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'kitchen', true, 10),
  ('Sleek Urban Kitchen', 'High-gloss finishes and smart storage solutions', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'kitchen', false, 11),
  
  -- Offices (need 2 more)
  ('Executive Home Office', 'Professional workspace with premium finishes and built-in storage', 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'office', false, 12),
  ('Creative Studio Space', 'Inspiring workspace designed for creativity and collaboration', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'office', false, 13),
  
  -- Bathrooms (need 2 more)
  ('Modern Master Bathroom', 'Sleek design with floating vanity and rainfall shower', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'bathroom', true, 14),
  ('Vintage-Inspired Powder Room', 'Classic elegance with modern amenities', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'bathroom', false, 15);
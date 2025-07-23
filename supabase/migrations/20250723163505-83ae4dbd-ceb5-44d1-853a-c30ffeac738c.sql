-- Create customer_reviews table
CREATE TABLE public.customer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  project_type TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for customer reviews
CREATE POLICY "Anyone can view active customer reviews" 
ON public.customer_reviews 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage customer reviews" 
ON public.customer_reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_reviews_updated_at
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.customer_reviews (name, review, rating, project_type, sort_order) VALUES
('Sarah Johnson', 'Remap transformed our living space into something beyond our dreams. The attention to detail and creative vision exceeded all expectations. Our home now perfectly reflects our family''s personality and lifestyle.', 5, 'Modern Family Home', 1),
('Michael Chen', 'Working with Remap was an absolute pleasure. They understood our vision from day one and delivered a commercial space that not only looks stunning but also enhances our business productivity.', 5, 'Office Renovation', 2),
('Emily Rodriguez', 'The team at Remap brought fresh ideas and innovative solutions to our apartment renovation. Every corner now has purpose and beauty. Couldn''t be happier with the final result!', 5, 'Apartment Makeover', 3),
('David Thompson', 'From concept to completion, Remap demonstrated professionalism and creativity. They transformed our outdated kitchen into the heart of our home. The quality of work is exceptional.', 5, 'Kitchen Remodel', 4);
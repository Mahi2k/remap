-- Create stats table for customizable statistics
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL,
  number_value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active stats" 
ON public.stats 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage stats" 
ON public.stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for timestamps
CREATE TRIGGER update_stats_updated_at
BEFORE UPDATE ON public.stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default stats data
INSERT INTO public.stats (icon_name, number_value, label, sort_order) VALUES
('Users', '500+', 'Happy Clients', 1),
('Award', '15+', 'Awards Won', 2),
('Clock', '10+', 'Years Experience', 3),
('Star', '4.9', 'Client Rating', 4);
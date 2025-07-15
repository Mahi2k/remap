-- Create company_contact_info table
CREATE TABLE public.company_contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL UNIQUE,
  field_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active company contact info" 
ON public.company_contact_info 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage company contact info" 
ON public.company_contact_info 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default contact information
INSERT INTO public.company_contact_info (field_name, field_value) VALUES 
('phone', '+1 (555) 123-4567'),
('email', 'hello@urbannest.design'),
('address', '123 Design District, Creative City, CC 12345'),
('hours', 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_company_contact_info_updated_at
BEFORE UPDATE ON public.company_contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
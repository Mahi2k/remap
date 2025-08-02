-- Fix function search path security issue
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = 'public';
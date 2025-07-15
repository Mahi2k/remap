-- Create an admin superuser
-- Note: You'll need to create this user through Supabase Auth UI first, then run this migration
-- For now, we'll create a placeholder that you can update with the actual user ID

-- Insert example admin profile (replace with actual user ID after creating user in Supabase Auth)
INSERT INTO public.profiles (user_id, display_name, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin User', 'admin@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Grant admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
-- Update the admin role to use the real authenticated user ID
UPDATE public.user_roles 
SET user_id = '6cca4acc-65cd-43f6-a94e-d0a494cdd0fa'
WHERE user_id = '00000000-0000-0000-0000-000000000000' 
AND role = 'admin';

-- Update the admin profile to use the real authenticated user ID
UPDATE public.profiles 
SET user_id = '6cca4acc-65cd-43f6-a94e-d0a494cdd0fa',
    email = 'mahendratandon.2k@gmail.com'
WHERE user_id = '00000000-0000-0000-0000-000000000000';
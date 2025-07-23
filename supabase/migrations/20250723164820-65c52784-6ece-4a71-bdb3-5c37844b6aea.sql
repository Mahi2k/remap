-- Add policy to allow anyone to submit customer reviews (but set them as inactive for moderation)
CREATE POLICY "Anyone can submit customer reviews" 
ON public.customer_reviews 
FOR INSERT 
WITH CHECK (true);
-- Fix security vulnerabilities in RLS policies

-- 1. Drop public write policies for categories, products, and site_settings
DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can manage site_settings" ON public.site_settings;

-- 2. Create admin-only management policies for categories
CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Create admin-only management policies for products
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Create admin-only management policies for site_settings
CREATE POLICY "Admins can manage site_settings" 
ON public.site_settings FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Make payment-screenshots bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'payment-screenshots';

-- 6. Drop public access policy for payment screenshots
DROP POLICY IF EXISTS "Payment screenshots are publicly accessible" ON storage.objects;

-- 7. Create admin-only access policy for viewing payment screenshots
CREATE POLICY "Admins can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots' AND has_role(auth.uid(), 'admin'));

-- 8. Allow authenticated users to upload payment screenshots
CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');
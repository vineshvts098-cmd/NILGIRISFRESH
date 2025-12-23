-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  pack_size TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for storing order submissions
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_screenshot_url TEXT,
  order_items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  upi_id TEXT,
  whatsapp_number TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products (anyone can view)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings FOR SELECT 
USING (true);

-- Public insert for orders (anyone can place an order)
CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Orders viewable only by admins (we'll add admin check later)
CREATE POLICY "Orders are viewable by everyone for now" 
ON public.orders FOR SELECT 
USING (true);

-- For now, allow public insert/update/delete on categories, products, settings (admin panel)
-- In production, add proper admin authentication
CREATE POLICY "Public can manage categories" 
ON public.categories FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Public can manage products" 
ON public.products FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Public can manage site_settings" 
ON public.site_settings FOR ALL 
USING (true) WITH CHECK (true);

-- Create storage bucket for product images and payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');

-- Storage policies for payment screenshots
CREATE POLICY "Payment screenshots are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Anyone can upload payment screenshots" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-screenshots');

-- Insert default site settings
INSERT INTO public.site_settings (hero_title, hero_subtitle, phone, email, address, upi_id, whatsapp_number)
VALUES (
  'Pure Tea from the Nilgiri Hills',
  'From the Hills to Your Cup',
  '+91 98765 43210',
  'hello@nilgirisfresh.com',
  'Gudalur, Nilgiris District, Tamil Nadu, India - 643212',
  'vineshvts098@okicici',
  '919876543210'
);

-- Insert default categories
INSERT INTO public.categories (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Premium Tea', 'Our finest selection of handpicked teas'),
  ('22222222-2222-2222-2222-222222222222', 'Classic Tea', 'Traditional Nilgiri tea blends'),
  ('33333333-3333-3333-3333-333333333333', 'Special Blends', 'Unique flavor combinations');

-- Insert default products
INSERT INTO public.products (name, description, price, pack_size, category_id, featured) VALUES
  ('Nilgiri Premium Dust', 'Our signature strong tea dust, perfect for a robust morning cup. Sourced from the finest estates in Gudalur.', 180, '250g', '11111111-1111-1111-1111-111111111111', true),
  ('Classic CTC Tea', 'Traditional CTC tea with rich color and bold flavor. Ideal for milk tea lovers.', 150, '250g', '22222222-2222-2222-2222-222222222222', true),
  ('Green Leaf Tea', 'Whole leaf green tea with natural antioxidants. Light, refreshing, and healthy.', 220, '100g', '33333333-3333-3333-3333-333333333333', true),
  ('Family Pack Dust', 'Economical family pack of our popular tea dust. Great value for daily use.', 350, '500g', '22222222-2222-2222-2222-222222222222', false),
  ('Premium Leaf Tea', 'Hand-rolled whole leaf tea with delicate aroma. For the tea connoisseur.', 280, '200g', '11111111-1111-1111-1111-111111111111', false),
  ('Masala Chai Blend', 'Pre-mixed spiced tea with cardamom, ginger, and cinnamon. Just add milk and water.', 200, '200g', '33333333-3333-3333-3333-333333333333', true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
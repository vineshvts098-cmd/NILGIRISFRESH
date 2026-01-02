-- Add payment_id field to orders table
ALTER TABLE public.orders ADD COLUMN payment_id TEXT;
-- Create whatsapp_otps table for OTP storage
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  channel text DEFAULT 'whatsapp' CHECK (channel IN ('sms', 'whatsapp')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone ON public.whatsapp_otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_created_at ON public.whatsapp_otps(created_at);

-- Add phone column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text UNIQUE;

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Enable RLS
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_otps (only service role can access)
CREATE POLICY "Service role can manage OTPs"
  ON public.whatsapp_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: Delete expired OTPs older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.whatsapp_otps
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- Run this manually in Supabase SQL Editor if pg_cron is available:
-- SELECT cron.schedule('cleanup-expired-otps', '*/30 * * * *', 'SELECT cleanup_expired_otps()');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_otps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_otps_updated_at
  BEFORE UPDATE ON public.whatsapp_otps
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_otps_updated_at();

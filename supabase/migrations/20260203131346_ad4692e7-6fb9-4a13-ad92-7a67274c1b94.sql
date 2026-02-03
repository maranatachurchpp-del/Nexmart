-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create stores table for multi-store functionality
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view own stores" 
ON public.stores FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stores" 
ON public.stores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores" 
ON public.stores FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stores" 
ON public.stores FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stores" 
ON public.stores FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add store_id column to produtos table
ALTER TABLE public.produtos ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_produtos_store_id ON public.produtos(store_id);
CREATE INDEX idx_stores_user_id ON public.stores(user_id);

-- Create trigger for stores updated_at
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
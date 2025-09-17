-- Create user roles system to replace insecure email-based admin access

-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get current user's roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Require authentication to view subscription plans (fix public pricing exposure)
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;

CREATE POLICY "Authenticated users can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Insert default admin role for the current admin email (temporary migration data)
-- This will need to be updated manually after migration
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
  u.id,
  'admin'::app_role,
  u.id
FROM auth.users u 
WHERE u.email = 'admin@nexmart.com.br'
ON CONFLICT (user_id, role) DO NOTHING;
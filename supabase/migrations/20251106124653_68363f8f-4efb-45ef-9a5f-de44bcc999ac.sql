-- Add missing RLS policies for user_subscriptions table
-- This allows users to create and update their own subscriptions

-- Policy for users to insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for admins to manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
-- Enable realtime for produtos table
ALTER TABLE public.produtos REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos;

-- Also enable for alert_history for real-time alerts
ALTER TABLE public.alert_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_history;
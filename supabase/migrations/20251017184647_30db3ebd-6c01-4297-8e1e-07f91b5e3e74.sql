-- Create table for storing machine configurations
CREATE TABLE IF NOT EXISTS public.machine_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.machine_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for machine_configs
CREATE POLICY "Admins can manage all machine configs"
  ON public.machine_configs
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own machine configs"
  ON public.machine_configs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own machine configs"
  ON public.machine_configs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create table for live log streaming
CREATE TABLE IF NOT EXISTS public.live_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_ip TEXT NOT NULL,
  log_path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_logs
CREATE POLICY "Authenticated users can view live logs"
  ON public.live_logs
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert live logs"
  ON public.live_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_live_logs_machine_ip ON public.live_logs(machine_ip);
CREATE INDEX idx_live_logs_created_at ON public.live_logs(created_at DESC);

-- Enable realtime for live_logs table
ALTER TABLE public.live_logs REPLICA IDENTITY FULL;
-- Add user_id column to passengers table
ALTER TABLE public.passengers 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to rides table  
ALTER TABLE public.rides
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to billing_records table
ALTER TABLE public.billing_records
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for passengers
CREATE POLICY "Users can view their own passengers" 
ON public.passengers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passengers" 
ON public.passengers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passengers" 
ON public.passengers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passengers" 
ON public.passengers FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for rides
CREATE POLICY "Users can view their own rides" 
ON public.rides FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rides" 
ON public.rides FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rides" 
ON public.rides FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rides" 
ON public.rides FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for billing_records
CREATE POLICY "Users can view their own billing records" 
ON public.billing_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own billing records" 
ON public.billing_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing records" 
ON public.billing_records FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing records" 
ON public.billing_records FOR DELETE 
USING (auth.uid() = user_id);
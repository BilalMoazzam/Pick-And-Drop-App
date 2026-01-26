-- Create passengers table
CREATE TABLE public.passengers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    profession TEXT,
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    school_office_info TEXT,
    is_regular BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rides table
CREATE TABLE public.rides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    passenger_id UUID REFERENCES public.passengers(id) ON DELETE SET NULL,
    passenger_name TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    drop_time TIMESTAMP WITH TIME ZONE,
    fare DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing_records table for monthly invoices
CREATE TABLE public.billing_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    passenger_id UUID REFERENCES public.passengers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_rides INTEGER DEFAULT 0,
    total_fare DECIMAL(10,2) DEFAULT 0,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow all access since this is a single-user app)
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (single-user app, no auth needed)
CREATE POLICY "Allow all operations on passengers" ON public.passengers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on rides" ON public.rides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on billing" ON public.billing_records FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_passengers_updated_at
    BEFORE UPDATE ON public.passengers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_pickup_time ON public.rides(pickup_time);
CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
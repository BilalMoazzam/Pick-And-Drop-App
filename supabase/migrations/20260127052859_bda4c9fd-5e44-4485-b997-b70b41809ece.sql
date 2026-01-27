-- Add attendance column to rides table for present/absent tracking
ALTER TABLE public.rides 
ADD COLUMN attendance text NOT NULL DEFAULT 'present' 
CHECK (attendance IN ('present', 'absent'));
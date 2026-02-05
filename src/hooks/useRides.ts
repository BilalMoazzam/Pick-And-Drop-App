import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { formatSar } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';

export interface Ride {
  id: string;
  passenger_id?: string;
  passenger_name: string;
  pickup_location: string;
  drop_location: string;
  pickup_time: string;
  drop_time?: string;
  fare: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance: 'present' | 'absent';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewRide {
  passenger_id?: string;
  passenger_name: string;
  pickup_location: string;
  drop_location: string;
  pickup_time: string;
  drop_time?: string;
  fare?: number;
  status?: string;
  attendance?: string;
  notes?: string;
}

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRides = async () => {
    if (!user) {
      setRides([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('pickup_time', { ascending: false });

      if (error) throw error;
      setRides(data as Ride[] || []);
    } catch (error: any) {
      toast({
        title: "Error loading rides",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRide = async (ride: NewRide) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to add rides.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert([{ ...ride, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setRides(prev => [data as Ride, ...prev]);
      toast({
        title: "Ride added! ✓",
        description: `Ride for ${ride.passenger_name} scheduled.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding ride",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRide = async (id: string, updates: Partial<NewRide>) => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRides(prev => prev.map(r => r.id === id ? data as Ride : r));
      toast({
        title: "Ride updated! ✓",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating ride",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAttendance = async (id: string, attendance: 'present' | 'absent') => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ attendance })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRides(prev => prev.map(r => r.id === id ? data as Ride : r));
      toast({
        title: attendance === 'present' ? "Marked Present ✓" : "Marked Absent ✗",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating attendance",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const completeRide = async (id: string, fare: number = 0) => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ 
          status: 'completed', 
          drop_time: new Date().toISOString(),
          fare 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRides(prev => prev.map(r => r.id === id ? data as Ride : r));
      toast({
        title: "Ride completed! ✓",
        description: `Fare: ${formatSar(fare)}`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error completing ride",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteRide = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRides(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Ride deleted",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting ride",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Get today's rides
  const getTodayRides = () => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    
    return rides.filter(ride => {
      const rideDate = new Date(ride.pickup_time);
      return rideDate >= start && rideDate <= end;
    });
  };

  // Get this week's rides
  const getWeekRides = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });
    
    return rides.filter(ride => {
      const rideDate = new Date(ride.pickup_time);
      return rideDate >= start && rideDate <= end;
    });
  };

  // Get this month's rides
  const getMonthRides = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    
    return rides.filter(ride => {
      const rideDate = new Date(ride.pickup_time);
      return rideDate >= start && rideDate <= end;
    });
  };

  // Calculate earnings
  const getEarnings = () => {
    const todayRides = getTodayRides().filter(r => r.status === 'completed');
    const weekRides = getWeekRides().filter(r => r.status === 'completed');
    const monthRides = getMonthRides().filter(r => r.status === 'completed');

    return {
      today: todayRides.reduce((sum, r) => sum + Number(r.fare), 0),
      week: weekRides.reduce((sum, r) => sum + Number(r.fare), 0),
      month: monthRides.reduce((sum, r) => sum + Number(r.fare), 0),
    };
  };

  useEffect(() => {
    fetchRides();
  }, [user]);

  return {
    rides,
    loading,
    addRide,
    updateRide,
    updateAttendance,
    completeRide,
    deleteRide,
    getTodayRides,
    getWeekRides,
    getMonthRides,
    getEarnings,
    refetch: fetchRides,
  };
}

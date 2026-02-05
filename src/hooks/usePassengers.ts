import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  profession?: string;
  pickup_location: string;
  drop_location: string;
  school_office_info?: string;
  is_regular: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewPassenger {
  name: string;
  phone: string;
  profession?: string;
  pickup_location: string;
  drop_location: string;
  school_office_info?: string;
  is_regular?: boolean;
}

export function usePassengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPassengers = async () => {
    if (!user) {
      setPassengers([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('passengers')
        .select('*')
        .order('name');

      if (error) throw error;
      setPassengers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading passengers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = async (passenger: NewPassenger) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to add passengers.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('passengers')
        .insert([{ ...passenger, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setPassengers(prev => [...prev, data]);
      toast({
        title: "Passenger added! ✓",
        description: `${passenger.name} has been added successfully.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding passenger",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePassenger = async (id: string, updates: Partial<NewPassenger>) => {
    try {
      const { data, error } = await supabase
        .from('passengers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPassengers(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Passenger updated! ✓",
        description: "Changes saved successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating passenger",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePassenger = async (id: string) => {
    try {
      const { error } = await supabase
        .from('passengers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPassengers(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Passenger removed",
        description: "Passenger has been deleted.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting passenger",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, [user]);

  return {
    passengers,
    loading,
    addPassenger,
    updatePassenger,
    deletePassenger,
    refetch: fetchPassengers,
  };
}

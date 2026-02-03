import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { RideCard } from '@/components/RideCard';
import { CompleteRideDialog } from '@/components/CompleteRideDialog';
import { PageHeader } from '@/components/PageHeader';
import { useRides, Ride } from '@/hooks/useRides';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'today' | 'week' | 'month';

const RidesPage = () => {
  const { rides, loading, completeRide, deleteRide } = useRides();
  const [filter, setFilter] = useState<FilterType>('all');
  const [completingRide, setCompletingRide] = useState<Ride | null>(null);

  const filteredRides = rides.filter(ride => {
    const rideDate = new Date(ride.pickup_time);
    const today = new Date();

    switch (filter) {
      case 'today':
        return rideDate >= startOfDay(today) && rideDate <= endOfDay(today);
      case 'week':
        return rideDate >= subDays(today, 7);
      case 'month':
        return rideDate >= subDays(today, 30);
      default:
        return true;
    }
  });

  const handleCompleteRide = (rideId: string) => {
    const ride = rides.find(r => r.id === rideId);
    if (ride) {
      setCompletingRide(ride);
    }
  };

  const handleConfirmComplete = async (fare: number) => {
    if (completingRide) {
      await completeRide(completingRide.id, fare);
      setCompletingRide(null);
    }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: 'week' },
    { label: '30 Days', value: 'month' },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      <PageHeader title="All Rides" subtitle={`${filteredRides.length} rides`} variant="card">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0',
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Rides List */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="ride-card animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No rides found
            </h3>
            <p className="text-muted-foreground">
              Try changing the filter
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRides.map((ride) => (
              <div key={ride.id}>
                <p className="text-xs text-muted-foreground font-medium mb-1 pl-2">
                  {format(new Date(ride.pickup_time), 'EEE, MMM d')}
                </p>
                <RideCard
                  ride={ride}
                  onComplete={handleCompleteRide}
                  onCancel={() => deleteRide(ride.id)}
                  showActions={ride.status === 'scheduled'}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Complete Ride Dialog */}
      <CompleteRideDialog
        open={!!completingRide}
        onOpenChange={(open) => !open && setCompletingRide(null)}
        onComplete={handleConfirmComplete}
        passengerName={completingRide?.passenger_name || ''}
      />

      <BottomNav />
    </div>
  );
};

export default RidesPage;

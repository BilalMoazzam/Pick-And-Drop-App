import { useState } from 'react';
import { Car, TrendingUp, Calendar, Wallet, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { RideCard } from '@/components/RideCard';
import { StatCard } from '@/components/StatCard';
import { AddActionMenu } from '@/components/AddActionMenu';
import { AddClientSheet } from '@/components/AddClientSheet';
import { CompleteRideDialog } from '@/components/CompleteRideDialog';
import { useRides, Ride } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';

const Index = () => {
  const { 
    rides, 
    loading, 
    addRide, 
    completeRide, 
    deleteRide,
    updateAttendance,
    getTodayRides, 
    getWeekRides, 
    getMonthRides, 
    getEarnings 
  } = useRides();
  const { passengers, addPassenger } = usePassengers();
  
  const [completingRide, setCompletingRide] = useState<Ride | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [isAddingRegular, setIsAddingRegular] = useState(true);

  const todayRides = getTodayRides();
  const scheduledToday = todayRides.filter(r => r.status === 'scheduled');
  const completedToday = todayRides.filter(r => r.status === 'completed');
  const earnings = getEarnings();

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

  const handleCancelRide = async (rideId: string) => {
    await deleteRide(rideId);
  };

  const handleToggleAttendance = async (rideId: string, attendance: 'present' | 'absent') => {
    await updateAttendance(rideId, attendance);
  };

  const handleAddRegular = () => {
    setIsAddingRegular(true);
    setAddClientOpen(true);
  };

  const handleAddRandom = () => {
    setIsAddingRegular(false);
    setAddClientOpen(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <Sun className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium">
              {getGreeting()}
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {format(new Date(), 'EEEE, MMM d')}
            </h1>
          </div>
        </div>

        {/* Quick Stats - 2 columns in first row, 1 full width below */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Car}
              label="Today"
              value={completedToday.length}
              subtext={`${scheduledToday.length} pending`}
            />
            <StatCard
              icon={Calendar}
              label="This Week"
              value={getWeekRides().filter(r => r.status === 'completed').length}
              variant="primary"
            />
          </div>
          <StatCard
            icon={Wallet}
            label="Today's Earnings"
            value={`SAR ${earnings.today}`}
            subtext="Keep up the great work!"
            variant="success"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6">
        {/* Today's Rides Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Today's Rides
          </h2>
          <span className="text-muted-foreground font-medium">
            {todayRides.length} total
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ride-card animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : scheduledToday.length === 0 && completedToday.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No rides today
            </h3>
            <p className="text-muted-foreground">
              Tap the + button to add a client
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledToday.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onComplete={handleCompleteRide}
                onCancel={handleCancelRide}
                onToggleAttendance={handleToggleAttendance}
              />
            ))}
            
            {completedToday.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-muted-foreground mt-6 mb-3">
                  Completed ({completedToday.length})
                </h3>
                {completedToday.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    showActions={false}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Menu */}
      <AddActionMenu 
        onAddRegular={handleAddRegular}
        onAddRandom={handleAddRandom}
      />

      {/* Add Client Sheet */}
      <AddClientSheet
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        isRegular={isAddingRegular}
        onAddClient={addPassenger}
      />

      {/* Complete Ride Dialog */}
      <CompleteRideDialog
        open={!!completingRide}
        onOpenChange={(open) => !open && setCompletingRide(null)}
        onComplete={handleConfirmComplete}
        passengerName={completingRide?.passenger_name || ''}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;

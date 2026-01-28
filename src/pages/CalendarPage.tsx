import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, UserCheck, UserX, Minus, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { rides } = useRides();
  const { passengers } = usePassengers();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const regularPassengers = passengers.filter(p => p.is_regular);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for padding
  const startDayOfWeek = getDay(monthStart);

  // Get ride status for a specific passenger on a specific date
  const getRideStatus = (passengerId: string, date: Date): 'present' | 'absent' | 'none' => {
    const ride = rides.find(r => {
      const rideDate = new Date(r.pickup_time);
      return r.passenger_id === passengerId && isSameDay(rideDate, date) && r.status === 'completed';
    });
    
    if (!ride) return 'none';
    return ride.attendance === 'absent' ? 'absent' : 'present';
  };

  // Calculate totals for selected passenger
  const getPassengerStats = (passengerId: string) => {
    let present = 0;
    let absent = 0;
    
    days.forEach(day => {
      const status = getRideStatus(passengerId, day);
      if (status === 'present') present++;
      if (status === 'absent') absent++;
    });
    
    return { present, absent };
  };

  // Overall stats including total earnings
  const overallStats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalEarnings = 0;
    
    regularPassengers.forEach(p => {
      const stats = getPassengerStats(p.id);
      totalPresent += stats.present;
      totalAbsent += stats.absent;
    });

    // Calculate earnings for the month
    rides.forEach(ride => {
      const rideDate = new Date(ride.pickup_time);
      if (rideDate >= monthStart && rideDate <= monthEnd && ride.status === 'completed' && ride.attendance === 'present') {
        totalEarnings += Number(ride.fare) || 0;
      }
    });
    
    return { totalPresent, totalAbsent, totalEarnings };
  }, [regularPassengers, rides, days, monthStart, monthEnd]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const selectedPassenger = regularPassengers.find(p => p.id === selectedClient);
  const selectedStats = selectedClient ? getPassengerStats(selectedClient) : null;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Monthly Attendance</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-sm">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-10 w-10">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM')}</h2>
            <p className="text-sm text-muted-foreground">{format(currentMonth, 'yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-10 w-10">
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {regularPassengers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <CalendarIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No regular clients
            </h3>
            <p className="text-muted-foreground">
              Add regular clients to track attendance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client Selector */}
            <div className="bg-card rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Select Client</h3>
              <ScrollArea className="h-24">
                <div className="flex gap-2 pb-2">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                      !selectedClient 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    All Clients
                  </button>
                  {regularPassengers.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedClient(p.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                        selectedClient === p.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-2xl p-4 shadow-sm">
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for padding */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Actual days */}
                {days.map(day => {
                  // Calculate status for this day
                  let dayStatus: 'present' | 'absent' | 'mixed' | 'none' = 'none';
                  
                  if (selectedClient) {
                    dayStatus = getRideStatus(selectedClient, day);
                  } else {
                    // Show aggregated status for all clients
                    const statuses = regularPassengers.map(p => getRideStatus(p.id, day));
                    const hasPresent = statuses.includes('present');
                    const hasAbsent = statuses.includes('absent');
                    
                    if (hasPresent && hasAbsent) dayStatus = 'mixed';
                    else if (hasPresent) dayStatus = 'present';
                    else if (hasAbsent) dayStatus = 'absent';
                  }

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-colors",
                        isToday(day) && "ring-2 ring-primary ring-offset-2",
                        dayStatus === 'present' && "bg-success/20 text-success",
                        dayStatus === 'absent' && "bg-destructive/20 text-destructive",
                        dayStatus === 'mixed' && "bg-warning/20 text-warning",
                        dayStatus === 'none' && "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className="text-xs">{format(day, 'd')}</span>
                      {dayStatus === 'present' && <UserCheck className="w-3 h-3 mt-0.5" />}
                      {dayStatus === 'absent' && <UserX className="w-3 h-3 mt-0.5" />}
                      {dayStatus === 'mixed' && <span className="text-[10px]">Mix</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-success">
                  {selectedStats ? selectedStats.present : overallStats.totalPresent}
                </p>
                <p className="text-sm text-muted-foreground">Present Days</p>
              </div>
              <div className="bg-destructive/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-destructive">
                  {selectedStats ? selectedStats.absent : overallStats.totalAbsent}
                </p>
                <p className="text-sm text-muted-foreground">Absent Days</p>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Earnings This Month</p>
              <p className="text-4xl font-bold text-primary">
                SAR {overallStats.totalEarnings.toFixed(0)}
              </p>
            </div>

            {/* Legend */}
            <div className="bg-card rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-success" />
                  </div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <UserX className="w-4 h-4 text-destructive" />
                  </div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-warning/20 flex items-center justify-center">
                    <span className="text-[10px] text-warning font-semibold">Mix</span>
                  </div>
                  <span>Mixed</span>
                </div>
              </div>
            </div>

            {/* Client Details (if selected) */}
            {selectedPassenger && selectedStats && (
              <div className="bg-card rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-lg mb-2">{selectedPassenger.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📍 {selectedPassenger.pickup_location} → {selectedPassenger.drop_location}</p>
                  <p>📱 {selectedPassenger.phone}</p>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                    <span className="text-success font-semibold">✓ {selectedStats.present} Present</span>
                    <span className="text-destructive font-semibold">✗ {selectedStats.absent} Absent</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default CalendarPage;

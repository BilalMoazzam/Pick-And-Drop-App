import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UserCheck, UserX, Minus, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CalendarPage = () => {
  const { rides } = useRides();
  const { passengers } = usePassengers();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePopup, setShowDatePopup] = useState(false);

  const regularPassengers = passengers.filter(p => p.is_regular);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);

  const getRideStatus = (passengerId: string, date: Date): 'present' | 'absent' | 'none' => {
    const ride = rides.find(r => {
      const rideDate = new Date(r.pickup_time);
      return r.passenger_id === passengerId && isSameDay(rideDate, date) && r.status === 'completed';
    });
    
    if (!ride) return 'none';
    return ride.attendance === 'absent' ? 'absent' : 'present';
  };

  const getPassengerStats = (passengerId: string) => {
    let present = 0;
    let absent = 0;
    let earnings = 0;
    
    days.forEach(day => {
      const status = getRideStatus(passengerId, day);
      if (status === 'present') {
        present++;
        const ride = rides.find(r => {
          const rideDate = new Date(r.pickup_time);
          return r.passenger_id === passengerId && isSameDay(rideDate, day) && r.status === 'completed' && r.attendance === 'present';
        });
        if (ride) {
          earnings += Number(ride.fare) || 0;
        }
      }
      if (status === 'absent') absent++;
    });
    
    return { present, absent, earnings };
  };

  const getDateAttendance = (date: Date) => {
    return regularPassengers.map(p => {
      const status = getRideStatus(p.id, date);
      const ride = rides.find(r => {
        const rideDate = new Date(r.pickup_time);
        return r.passenger_id === p.id && isSameDay(rideDate, date) && r.status === 'completed';
      });
      return {
        passenger: p,
        status,
        fare: ride ? Number(ride.fare) || 0 : 0
      };
    });
  };

  const overallStats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalEarnings = 0;
    
    regularPassengers.forEach(p => {
      const stats = getPassengerStats(p.id);
      totalPresent += stats.present;
      totalAbsent += stats.absent;
      totalEarnings += stats.earnings;
    });
    
    return { totalPresent, totalAbsent, totalEarnings };
  }, [regularPassengers, rides, days]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const selectedPassenger = regularPassengers.find(p => p.id === selectedClient);
  const selectedStats = selectedClient ? getPassengerStats(selectedClient) : null;

  const displayStats = selectedStats 
    ? { present: selectedStats.present, absent: selectedStats.absent, earnings: selectedStats.earnings }
    : { present: overallStats.totalPresent, absent: overallStats.totalAbsent, earnings: overallStats.totalEarnings };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleDateClick = (day: Date) => {
    if (!selectedClient) {
      setSelectedDate(day);
      setShowDatePopup(true);
    }
  };

  const dateAttendance = selectedDate ? getDateAttendance(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      <PageHeader title="Calendar" subtitle={format(currentMonth, 'MMMM yyyy')}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl p-3 shadow-sm">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-9 w-9">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM')}</h2>
            <p className="text-xs text-muted-foreground">{format(currentMonth, 'yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-9 w-9">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </PageHeader>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
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
            {/* Client Selector - Horizontal Scroll */}
            <div className="bg-card rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Select Client</h3>
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
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
                        "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                        selectedClient === p.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
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
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      disabled={!!selectedClient}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-colors",
                        isToday(day) && "ring-2 ring-primary ring-offset-2",
                        dayStatus === 'present' && "bg-success/20 text-success",
                        dayStatus === 'absent' && "bg-destructive/20 text-destructive",
                        dayStatus === 'mixed' && "bg-warning/20 text-warning",
                        dayStatus === 'none' && "bg-muted/50 text-muted-foreground",
                        !selectedClient && dayStatus !== 'none' && "cursor-pointer hover:opacity-80"
                      )}
                    >
                      <span className="text-xs">{format(day, 'd')}</span>
                      {dayStatus === 'present' && <UserCheck className="w-3 h-3 mt-0.5" />}
                      {dayStatus === 'absent' && <UserX className="w-3 h-3 mt-0.5" />}
                      {dayStatus === 'mixed' && <span className="text-[10px]">Mix</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-success">
                  {displayStats.present}
                </p>
                <p className="text-sm text-muted-foreground">Present Days</p>
              </div>
              <div className="bg-destructive/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-destructive">
                  {displayStats.absent}
                </p>
                <p className="text-sm text-muted-foreground">Absent Days</p>
              </div>
            </div>

            {/* Total Earnings - Shows individual or all based on selection */}
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {selectedClient ? `${selectedPassenger?.name}'s Earnings` : 'Total Earnings This Month'}
              </p>
              <p className="text-4xl font-bold text-primary">
                SAR {displayStats.earnings.toFixed(0)}
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
              {!selectedClient && (
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Tap on any date to see all clients' attendance details
                </p>
              )}
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

      {/* Date Attendance Popup */}
      <Dialog open={showDatePopup} onOpenChange={setShowDatePopup}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm max-h-[calc(100vh-32px)] overflow-hidden rounded-2xl p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-lg">
              {selectedDate && format(selectedDate, 'EEEE, MMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {dateAttendance.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No attendance data for this date</p>
            ) : (
              dateAttendance.map(({ passenger, status, fare }) => (
                <div
                  key={passenger.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    status === 'present' && "bg-success/10",
                    status === 'absent' && "bg-destructive/10",
                    status === 'none' && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                      status === 'present' && "bg-success",
                      status === 'absent' && "bg-destructive",
                      status === 'none' && "bg-muted-foreground"
                    )}>
                      {passenger.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{passenger.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {status === 'present' && `Present - SAR ${fare}`}
                        {status === 'absent' && 'Absent'}
                        {status === 'none' && 'No ride scheduled'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {status === 'present' && <UserCheck className="w-6 h-6 text-success" />}
                    {status === 'absent' && <UserX className="w-6 h-6 text-destructive" />}
                    {status === 'none' && <Minus className="w-6 h-6 text-muted-foreground" />}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Summary */}
          {dateAttendance.length > 0 && (
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-success font-semibold">
                  ✓ {dateAttendance.filter(d => d.status === 'present').length} Present
                </span>
                <span className="text-destructive font-semibold">
                  ✗ {dateAttendance.filter(d => d.status === 'absent').length} Absent
                </span>
              </div>
              <p className="text-center mt-2 text-lg font-bold text-primary">
                Total: SAR {dateAttendance.reduce((sum, d) => sum + d.fare, 0)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;

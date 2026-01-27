import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, UserCheck, UserX, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { rides } = useRides();
  const { passengers } = usePassengers();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const regularPassengers = passengers.filter(p => p.is_regular);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get ride status for a specific passenger on a specific date
  const getRideStatus = (passengerId: string, date: Date): 'present' | 'absent' | 'none' => {
    const ride = rides.find(r => {
      const rideDate = new Date(r.pickup_time);
      return r.passenger_id === passengerId && isSameDay(rideDate, date) && r.status === 'completed';
    });
    
    if (!ride) return 'none';
    return ride.attendance === 'absent' ? 'absent' : 'present';
  };

  // Calculate totals for each passenger
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

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Attendance Calendar</h1>
            <p className="text-muted-foreground">Monthly overview</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl p-3">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content - Scrollable Grid */}
      <main className="px-3 py-4">
        {regularPassengers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No regular clients
            </h3>
            <p className="text-muted-foreground">
              Add regular clients to see attendance
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  {/* Client Name Header */}
                  <th className="sticky left-0 z-10 bg-card border border-border p-2 text-left font-bold text-sm min-w-[120px]">
                    Regular Client
                  </th>
                  {/* Date Headers */}
                  {days.map(day => (
                    <th 
                      key={day.toISOString()} 
                      className={cn(
                        "border border-border p-1 text-center font-semibold text-xs min-w-[36px]",
                        isToday(day) && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div>{format(day, 'd')}</div>
                      <div className="text-[10px] opacity-70">{format(day, 'EEE').charAt(0)}</div>
                    </th>
                  ))}
                  {/* Totals Headers */}
                  <th className="border border-border p-1 text-center font-semibold text-xs min-w-[36px] bg-success/20">
                    ✓
                  </th>
                  <th className="border border-border p-1 text-center font-semibold text-xs min-w-[36px] bg-destructive/20">
                    ✗
                  </th>
                </tr>
              </thead>
              <tbody>
                {regularPassengers.map(passenger => {
                  const stats = getPassengerStats(passenger.id);
                  return (
                    <tr key={passenger.id}>
                      {/* Client Name */}
                      <td className="sticky left-0 z-10 bg-card border border-border p-2 font-medium text-sm truncate max-w-[120px]">
                        {passenger.name}
                      </td>
                      {/* Daily Status */}
                      {days.map(day => {
                        const status = getRideStatus(passenger.id, day);
                        return (
                          <td 
                            key={day.toISOString()} 
                            className={cn(
                              "border border-border p-1 text-center",
                              status === 'present' && "bg-success/20",
                              status === 'absent' && "bg-destructive/20",
                              isToday(day) && status === 'none' && "bg-primary/10"
                            )}
                          >
                            {status === 'present' && (
                              <UserCheck className="w-4 h-4 text-success mx-auto" />
                            )}
                            {status === 'absent' && (
                              <UserX className="w-4 h-4 text-destructive mx-auto" />
                            )}
                            {status === 'none' && (
                              <Minus className="w-3 h-3 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                      {/* Totals */}
                      <td className="border border-border p-1 text-center font-bold text-sm bg-success/20 text-success">
                        {stats.present}
                      </td>
                      <td className="border border-border p-1 text-center font-bold text-sm bg-destructive/20 text-destructive">
                        {stats.absent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 card-warm p-4">
          <h3 className="font-bold mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-success/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-success" />
              </div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-destructive/20 flex items-center justify-center">
                <UserX className="w-4 h-4 text-destructive" />
              </div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                <Minus className="w-3 h-3 text-muted-foreground/30" />
              </div>
              <span>No ride</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card-warm p-4 text-center">
            <p className="text-3xl font-bold text-success">
              {regularPassengers.reduce((sum, p) => sum + getPassengerStats(p.id).present, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Present</p>
          </div>
          <div className="card-warm p-4 text-center">
            <p className="text-3xl font-bold text-destructive">
              {regularPassengers.reduce((sum, p) => sum + getPassengerStats(p.id).absent, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Absent</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CalendarPage;

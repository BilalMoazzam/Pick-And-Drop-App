import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Users, Car, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const regularPassengers = passengers.filter(p => p.is_regular);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the starting day offset (0 = Sunday)
  const startDayOffset = getDay(monthStart);

  // Get rides for a specific date
  const getRidesForDate = (date: Date) => {
    return rides.filter(ride => {
      const rideDate = new Date(ride.pickup_time);
      return isSameDay(rideDate, date);
    });
  };

  // Get rides for selected date
  const selectedDateRides = useMemo(() => {
    if (!selectedDate) return [];
    return getRidesForDate(selectedDate);
  }, [selectedDate, rides]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Monthly ride overview</p>
          </div>
        </div>

        {/* Regular Clients Count */}
        <div className="card-warm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Clients</p>
              <p className="text-2xl font-bold">{regularPassengers.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="card-warm p-4 mb-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {days.map(day => {
              const dayRides = getRidesForDate(day);
              const hasRides = dayRides.length > 0;
              const completedRides = dayRides.filter(r => r.status === 'completed').length;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors relative",
                    isToday(day) && "bg-primary text-primary-foreground",
                    !isToday(day) && isSelected && "bg-primary/20 border-2 border-primary",
                    !isToday(day) && !isSelected && "hover:bg-muted",
                    hasRides && !isToday(day) && "font-bold"
                  )}
                >
                  {format(day, 'd')}
                  {hasRides && (
                    <div className="flex gap-0.5 mt-0.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        completedRides > 0 ? "bg-success" : "bg-info"
                      )} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {selectedDateRides.length === 0 ? (
              <div className="card-warm p-6 text-center">
                <Car className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No rides on this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateRides.map(ride => (
                  <div key={ride.id} className="card-warm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          ride.attendance === 'present' ? "bg-success/20" : "bg-destructive/20"
                        )}>
                          {ride.attendance === 'present' ? (
                            <UserCheck className="w-5 h-5 text-success" />
                          ) : (
                            <UserX className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{ride.passenger_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(ride.pickup_time), 'h:mm a')} • {ride.status}
                          </p>
                        </div>
                      </div>
                      {ride.status === 'completed' && (
                        <span className="font-bold text-success">SAR {Number(ride.fare).toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Clients List */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Regular Clients
          </h3>
          {regularPassengers.length === 0 ? (
            <div className="card-warm p-6 text-center">
              <p className="text-muted-foreground">No regular clients yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {regularPassengers.map(passenger => (
                <div key={passenger.id} className="card-warm p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{passenger.name}</p>
                    <p className="text-sm text-muted-foreground">{passenger.pickup_location} → {passenger.drop_location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CalendarPage;

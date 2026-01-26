import { MapPin, Clock, User, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ride } from '@/hooks/useRides';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RideCardProps {
  ride: Ride;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export function RideCard({ ride, onComplete, onCancel, showActions = true }: RideCardProps) {
  const statusColors = {
    scheduled: 'border-l-info',
    in_progress: 'border-l-warning',
    completed: 'border-l-success',
    cancelled: 'border-l-destructive',
  };

  const statusBadges = {
    scheduled: 'badge-scheduled',
    in_progress: 'bg-warning/15 text-warning font-semibold px-3 py-1 rounded-full text-sm',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };

  return (
    <div className={cn('ride-card animate-fade-in', statusColors[ride.status])}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{ride.passenger_name}</h3>
            <span className={statusBadges[ride.status]}>
              {ride.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        {ride.status === 'completed' && (
          <span className="text-xl font-bold text-success">
            SAR {Number(ride.fare).toFixed(0)}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {format(new Date(ride.pickup_time), 'h:mm a')}
          </span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 text-success" />
          <span>{ride.pickup_location}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 text-destructive" />
          <span>{ride.drop_location}</span>
        </div>
      </div>

      {showActions && ride.status === 'scheduled' && (
        <div className="flex gap-2">
          <Button
            variant="success"
            size="default"
            className="flex-1"
            onClick={() => onComplete?.(ride.id)}
          >
            <CheckCircle2 className="w-5 h-5" />
            Complete
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onCancel?.(ride.id)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

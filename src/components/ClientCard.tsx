import { Phone, MapPin, Building, Users, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  id: string;
  name: string;
  phone: string;
  profession?: string | null;
  pickup_location: string;
  drop_location: string;
  is_regular: boolean | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({
  name,
  phone,
  profession,
  pickup_location,
  drop_location,
  is_regular,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border animate-fade-in">
      {/* Top Row: Avatar + Name/Tag Row + Action Buttons */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
          is_regular ? "bg-primary/10" : "bg-warning/10"
        )}>
          {is_regular ? (
            <Users className="w-6 h-6 text-primary" />
          ) : (
            <UserPlus className="w-6 h-6 text-warning" />
          )}
        </div>

        {/* Name + Tag + Phone */}
        <div className="flex-1 min-w-0">
          {/* Name and Tag on same line with space-between */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-lg text-foreground truncate flex-1">
              {name}
            </h3>
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0",
              is_regular 
                ? "bg-primary/15 text-primary" 
                : "bg-warning/15 text-warning"
            )}>
              {is_regular ? 'Regular' : 'Random'}
            </span>
          </div>
          
          {/* Phone */}
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-sm">{phone}</span>
          </p>
          
          {/* Profession */}
          {profession && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span>{profession}</span>
            </p>
          )}
        </div>
      </div>

      {/* Locations */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
          <MapPin className="w-4 h-4 text-success flex-shrink-0" />
          <span className="truncate">{pickup_location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-destructive flex-shrink-0" />
          <span className="truncate">{drop_location}</span>
        </div>
      </div>

      {/* Modern Action Buttons */}
      <div className="mt-4 pt-3 border-t border-border flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all active:scale-[0.98]"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium transition-all active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Car, Users, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActionMenuProps {
  onAddRide: () => void;
  onAddClient: (isRegular: boolean) => void;
}

export function AddActionMenu({ onAddRide, onAddClient }: AddActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddRide = () => {
    onAddRide();
    setIsOpen(false);
  };

  const handleAddRegularClient = () => {
    onAddClient(true);
    setIsOpen(false);
  };

  const handleAddRandomClient = () => {
    onAddClient(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <>
            <button
              onClick={handleAddRandomClient}
              className="flex items-center gap-3 bg-accent text-accent-foreground px-5 py-4 rounded-2xl shadow-lg animate-scale-in"
              style={{ animationDelay: '0ms' }}
            >
              <UserPlus className="w-6 h-6" />
              <span className="font-bold text-lg">Random Client</span>
            </button>
            <button
              onClick={handleAddRegularClient}
              className="flex items-center gap-3 bg-success text-success-foreground px-5 py-4 rounded-2xl shadow-lg animate-scale-in"
              style={{ animationDelay: '50ms' }}
            >
              <Users className="w-6 h-6" />
              <span className="font-bold text-lg">Regular Client</span>
            </button>
            <button
              onClick={handleAddRide}
              className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-4 rounded-2xl shadow-lg animate-scale-in"
              style={{ animationDelay: '100ms' }}
            >
              <Car className="w-6 h-6" />
              <span className="font-bold text-lg">Add Ride</span>
            </button>
          </>
        )}
      </div>

      {/* FAB */}
      <button 
        className={cn(
          "fab transition-transform duration-200",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
      </button>
    </>
  );
}

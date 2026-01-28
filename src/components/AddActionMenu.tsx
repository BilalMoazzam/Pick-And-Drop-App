import { useState } from 'react';
import { Plus, Car, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActionMenuProps {
  onAddRide: () => void;
}

export function AddActionMenu({ onAddRide }: AddActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddRide = () => {
    onAddRide();
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
          <button
            onClick={handleAddRide}
            className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-4 rounded-2xl shadow-lg animate-scale-in"
          >
            <Car className="w-6 h-6" />
            <span className="font-bold text-lg">Add Ride</span>
          </button>
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

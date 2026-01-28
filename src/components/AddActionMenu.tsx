import { useState } from 'react';
import { Plus, Users, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActionMenuProps {
  onAddRegular: () => void;
  onAddRandom: () => void;
}

export function AddActionMenu({ onAddRegular, onAddRandom }: AddActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddRegular = () => {
    onAddRegular();
    setIsOpen(false);
  };

  const handleAddRandom = () => {
    onAddRandom();
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
              onClick={handleAddRegular}
              className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg animate-scale-in"
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Add Regular Client</span>
            </button>
            <button
              onClick={handleAddRandom}
              className="flex items-center gap-3 bg-warning text-warning-foreground px-4 py-3 rounded-xl shadow-lg animate-scale-in"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-semibold">Add Random Client</span>
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

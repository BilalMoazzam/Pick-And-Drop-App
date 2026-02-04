import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, CheckCircle2 } from 'lucide-react';

interface CompleteRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (fare: number) => void;
  passengerName: string;
}

export function CompleteRideDialog({ 
  open, 
  onOpenChange, 
  onComplete,
  passengerName 
}: CompleteRideDialogProps) {
  const [fare, setFare] = useState('');
  const [loading, setLoading] = useState(false);

  const quickFares = [10, 15, 20, 25, 30, 50];

  const handleComplete = async () => {
    setLoading(true);
    await onComplete(fare ? parseFloat(fare) : 0);
    setLoading(false);
    setFare('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Complete Ride
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-muted-foreground">Ride for</p>
            <p className="text-xl font-bold text-foreground">{passengerName}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Banknote className="w-5 h-5 text-success" />
              Enter Fare (﷼)
            </Label>
            <Input
              type="number"
              className="input-elderly text-center text-2xl font-bold"
              placeholder="0"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickFares.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="h-12 text-lg font-bold"
                onClick={() => setFare(amount.toString())}
              >
                {amount}
              </Button>
            ))}
          </div>

          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={handleComplete}
            disabled={loading}
          >
            <CheckCircle2 className="w-6 h-6" />
            {loading ? 'Completing...' : 'Complete Ride'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

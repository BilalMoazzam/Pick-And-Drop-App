import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, MapPin, Clock, Banknote } from 'lucide-react';
import { Passenger } from '@/hooks/usePassengers';
import { NewRide } from '@/hooks/useRides';
import { cn } from '@/lib/utils';

interface AddRideSheetProps {
  passengers: Passenger[];
  onAddRide: (ride: NewRide) => Promise<any>;
}

export function AddRideSheet({ passengers, onAddRide }: AddRideSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [isNewPassenger, setIsNewPassenger] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    passenger_name: '',
    pickup_location: '',
    drop_location: '',
    pickup_time: new Date().toISOString().slice(0, 16),
    fare: '',
  });

  const handleSelectPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setIsNewPassenger(false);
    setFormData({
      ...formData,
      passenger_name: passenger.name,
      pickup_location: passenger.pickup_location,
      drop_location: passenger.drop_location,
    });
  };

  const handleNewPassenger = () => {
    setSelectedPassenger(null);
    setIsNewPassenger(true);
    setFormData({
      passenger_name: '',
      pickup_location: '',
      drop_location: '',
      pickup_time: new Date().toISOString().slice(0, 16),
      fare: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.passenger_name || !formData.pickup_location || !formData.drop_location) {
      return;
    }

    setLoading(true);
    
    const ride: NewRide = {
      passenger_id: selectedPassenger?.id,
      passenger_name: formData.passenger_name,
      pickup_location: formData.pickup_location,
      drop_location: formData.drop_location,
      pickup_time: new Date(formData.pickup_time).toISOString(),
      fare: formData.fare ? parseFloat(formData.fare) : 0,
      status: 'scheduled',
    };

    const result = await onAddRide(ride);
    setLoading(false);

    if (result) {
      setOpen(false);
      setSelectedPassenger(null);
      setIsNewPassenger(false);
      setFormData({
        passenger_name: '',
        pickup_location: '',
        drop_location: '',
        pickup_time: new Date().toISOString().slice(0, 16),
        fare: '',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fab">
          <Plus className="w-8 h-8" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold">Add New Ride</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-6">
          {/* Passenger Selection */}
          {!selectedPassenger && !isNewPassenger && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Select Passenger</Label>
              <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
                {passengers.map((passenger) => (
                  <button
                    key={passenger.id}
                    onClick={() => handleSelectPassenger(passenger)}
                    className="p-4 rounded-xl bg-muted hover:bg-primary/10 text-left transition-colors border-2 border-transparent hover:border-primary"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold truncate">{passenger.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleNewPassenger}
              >
                <Plus className="w-5 h-5" />
                New Passenger
              </Button>
            </div>
          )}

          {/* Ride Form */}
          {(selectedPassenger || isNewPassenger) && (
            <div className="space-y-4">
              {selectedPassenger && (
                <div className="p-4 rounded-xl bg-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg">{selectedPassenger.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPassenger(null)}
                  >
                    Change
                  </Button>
                </div>
              )}

              {isNewPassenger && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" /> Passenger Name
                  </Label>
                  <Input
                    className="input-elderly"
                    placeholder="Enter name"
                    value={formData.passenger_name}
                    onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" /> Pickup Location
                </Label>
                <Input
                  className="input-elderly"
                  placeholder="Where to pick up?"
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-destructive" /> Drop Location
                </Label>
                <Input
                  className="input-elderly"
                  placeholder="Where to drop off?"
                  value={formData.drop_location}
                  onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pickup Time
                </Label>
                <Input
                  type="datetime-local"
                  className="input-elderly"
                  value={formData.pickup_time}
                  onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Banknote className="w-4 h-4" /> Fare (SAR) - Optional
                </Label>
                <Input
                  type="number"
                  className="input-elderly"
                  placeholder="0"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={loading || !formData.passenger_name || !formData.pickup_location || !formData.drop_location}
              >
                {loading ? 'Adding...' : 'Add Ride'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, MapPin, Clock, Banknote, Users, UserPlus, ArrowLeft, Plus } from 'lucide-react';
import { Passenger } from '@/hooks/usePassengers';
import { NewRide } from '@/hooks/useRides';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Step = 'type' | 'select-regular' | 'select-random' | 'new-form' | 'ride-details';

interface AddRideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passengers: Passenger[];
  onAddRide: (ride: NewRide) => Promise<any>;
}

export function AddRideSheet({ open, onOpenChange, passengers, onAddRide }: AddRideSheetProps) {
  const [step, setStep] = useState<Step>('type');
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

  const regularPassengers = passengers.filter(p => p.is_regular);
  const randomPassengers = passengers.filter(p => !p.is_regular);

  // Reset when sheet opens/closes
  useEffect(() => {
    if (open) {
      setStep('type');
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
  }, [open]);

  const handleSelectPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setIsNewPassenger(false);
    setFormData({
      ...formData,
      passenger_name: passenger.name,
      pickup_location: passenger.pickup_location,
      drop_location: passenger.drop_location,
    });
    setStep('ride-details');
  };

  const handleNewPassenger = (isRegular: boolean) => {
    setSelectedPassenger(null);
    setIsNewPassenger(true);
    setFormData({
      passenger_name: '',
      pickup_location: '',
      drop_location: '',
      pickup_time: new Date().toISOString().slice(0, 16),
      fare: '',
    });
    setStep('new-form');
  };

  const handleBack = () => {
    if (step === 'select-regular' || step === 'select-random') {
      setStep('type');
    } else if (step === 'new-form' || step === 'ride-details') {
      setSelectedPassenger(null);
      setStep('type');
    }
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
      onOpenChange(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'type': return 'Add Ride';
      case 'select-regular': return 'Select Regular Client';
      case 'select-random': return 'Select Random Client';
      case 'new-form': return 'New Passenger Details';
      case 'ride-details': return 'Ride Details';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col">
        <SheetHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step !== 'type' && (
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <SheetTitle className="text-2xl font-bold">{getTitle()}</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pb-4">
          {/* Step 1: Choose Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">What type of ride do you want to add?</p>
              
              <button
                onClick={() => setStep('select-regular')}
                className="w-full p-5 rounded-2xl bg-primary/10 border-2 border-primary/20 hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Regular Client</h3>
                    <p className="text-sm text-muted-foreground">Select from your regular passengers</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('select-random')}
                className="w-full p-5 rounded-2xl bg-warning/10 border-2 border-warning/20 hover:border-warning transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Random Client</h3>
                    <p className="text-sm text-muted-foreground">One-time or occasional passenger</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2a: Select Regular Client */}
          {step === 'select-regular' && (
            <div className="space-y-3">
              {regularPassengers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No regular clients yet</p>
                  <Button onClick={() => handleNewPassenger(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Regular Client
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-2 pr-2">
                      {regularPassengers.map((passenger) => (
                        <button
                          key={passenger.id}
                          onClick={() => handleSelectPassenger(passenger)}
                          className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold truncate">{passenger.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {passenger.pickup_location} → {passenger.drop_location}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => handleNewPassenger(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Regular Client
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 2b: Select Random Client */}
          {step === 'select-random' && (
            <div className="space-y-3">
              {randomPassengers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No random clients yet</p>
                  <Button variant="secondary" onClick={() => handleNewPassenger(false)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Random Client
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-2 pr-2">
                      {randomPassengers.map((passenger) => (
                        <button
                          key={passenger.id}
                          onClick={() => handleSelectPassenger(passenger)}
                          className="w-full p-4 rounded-xl bg-card border border-border hover:border-warning hover:bg-warning/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                              <User className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold truncate">{passenger.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {passenger.pickup_location} → {passenger.drop_location}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => handleNewPassenger(false)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Random Client
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 3: New Passenger Form */}
          {step === 'new-form' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> Passenger Name *
                </Label>
                <Input
                  className="input-elderly"
                  placeholder="Enter full name"
                  value={formData.passenger_name}
                  onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" /> Pickup Location *
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
                  <MapPin className="w-4 h-4 text-destructive" /> Drop Location *
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
                  <Clock className="w-4 h-4" /> Pickup Time *
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
                  <Banknote className="w-4 h-4" /> Fare (﷼) - Optional
                </Label>
                <Input
                  type="number"
                  className="input-elderly"
                  placeholder="0"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 4: Ride Details for Selected Passenger */}
          {step === 'ride-details' && selectedPassenger && (
            <div className="space-y-4">
              {/* Selected Passenger Card */}
              <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedPassenger.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPassenger.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" /> Pickup Location
                </Label>
                <Input
                  className="input-elderly"
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
                  <Banknote className="w-4 h-4" /> Fare (﷼) - Optional
                </Label>
                <Input
                  type="number"
                  className="input-elderly"
                  placeholder="0"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        {(step === 'new-form' || step === 'ride-details') && (
          <div className="flex-shrink-0 pt-4 border-t border-border">
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
      </SheetContent>
    </Sheet>
  );
}

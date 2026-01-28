import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, MapPin, Building } from 'lucide-react';
import { NewPassenger } from '@/hooks/usePassengers';

interface AddClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRegular: boolean;
  onAddClient: (client: NewPassenger) => Promise<any>;
}

export function AddClientSheet({ open, onOpenChange, isRegular, onAddClient }: AddClientSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewPassenger>({
    name: '',
    phone: '',
    profession: '',
    pickup_location: '',
    drop_location: '',
    school_office_info: '',
    is_regular: isRegular,
  });

  // Reset form when sheet opens/closes or type changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        phone: '',
        profession: '',
        pickup_location: '',
        drop_location: '',
        school_office_info: '',
        is_regular: isRegular,
      });
    }
  }, [open, isRegular]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.pickup_location || !formData.drop_location) {
      return;
    }

    setLoading(true);
    const result = await onAddClient({ ...formData, is_regular: isRegular });
    setLoading(false);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl flex flex-col">
        <SheetHeader className="pb-4 flex-shrink-0">
          <SheetTitle className="text-2xl font-bold">
            Add {isRegular ? 'Regular' : 'Random'} Client
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {isRegular ? 'Permanent/recurring client' : 'One-time pickup client'}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Name *
            </Label>
            <Input
              className="input-elderly"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number *
            </Label>
            <Input
              type="tel"
              className="input-elderly"
              placeholder="+966 5XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" /> Profession
            </Label>
            <Input
              className="input-elderly"
              placeholder="e.g. Student, Teacher, Engineer"
              value={formData.profession || ''}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-success" /> Pickup Location *
            </Label>
            <Input
              className="input-elderly"
              placeholder="Home address or pickup point"
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
              placeholder="School, office, or destination"
              value={formData.drop_location}
              onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">School/Office Info</Label>
            <Input
              className="input-elderly"
              placeholder="Additional details (optional)"
              value={formData.school_office_info || ''}
              onChange={(e) => setFormData({ ...formData, school_office_info: e.target.value })}
            />
          </div>
        </div>

        {/* Fixed Submit Button */}
        <div className="flex-shrink-0 pt-4 border-t border-border">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.phone || !formData.pickup_location || !formData.drop_location}
          >
            {loading ? 'Adding...' : `Add ${isRegular ? 'Regular' : 'Random'} Client`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

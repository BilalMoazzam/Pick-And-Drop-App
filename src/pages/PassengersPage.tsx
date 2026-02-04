import { useState, useMemo } from 'react';
import { Plus, User, Phone, MapPin, Building, Search, Users, UserPlus } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { ClientCard } from '@/components/ClientCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePassengers, Passenger, NewPassenger } from '@/hooks/usePassengers';
import { cn } from '@/lib/utils';

const PassengersPage = () => {
  const { passengers, loading, addPassenger, updatePassenger, deletePassenger } = usePassengers();
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [deletingPassenger, setDeletingPassenger] = useState<Passenger | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('regular');
  
  const [formData, setFormData] = useState<NewPassenger>({
    name: '',
    phone: '',
    profession: '',
    pickup_location: '',
    drop_location: '',
    school_office_info: '',
    is_regular: true,
  });

  const { regularPassengers, randomPassengers } = useMemo(() => {
    const filtered = passengers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
    return {
      regularPassengers: filtered.filter(p => p.is_regular),
      randomPassengers: filtered.filter(p => !p.is_regular),
    };
  }, [passengers, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      profession: '',
      pickup_location: '',
      drop_location: '',
      school_office_info: '',
      is_regular: activeTab === 'regular',
    });
    setEditingPassenger(null);
  };

  const handleOpenSheet = (passenger?: Passenger) => {
    if (passenger) {
      setEditingPassenger(passenger);
      setFormData({
        name: passenger.name,
        phone: passenger.phone,
        profession: passenger.profession || '',
        pickup_location: passenger.pickup_location,
        drop_location: passenger.drop_location,
        school_office_info: passenger.school_office_info || '',
        is_regular: passenger.is_regular,
      });
    } else {
      resetForm();
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.pickup_location || !formData.drop_location) {
      return;
    }

    setFormLoading(true);

    if (editingPassenger) {
      await updatePassenger(editingPassenger.id, formData);
    } else {
      await addPassenger(formData);
    }

    setFormLoading(false);
    setSheetOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingPassenger) {
      await deletePassenger(deletingPassenger.id);
      setDeletingPassenger(null);
    }
  };

  const renderPassengerList = (passengerList: Passenger[], emptyMessage: string, emptyIcon: React.ReactNode) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-warm animate-pulse">
              <div className="h-16 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      );
    }

    if (passengerList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            {emptyIcon}
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {searchQuery ? 'No clients found' : emptyMessage}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search' : 'Add your first client'}
          </p>
          {!searchQuery && (
            <Button onClick={() => handleOpenSheet()}>
              <Plus className="w-5 h-5" />
              Add Client
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {passengerList.map((passenger) => (
          <ClientCard
            key={passenger.id}
            id={passenger.id}
            name={passenger.name}
            phone={passenger.phone}
            profession={passenger.profession}
            pickup_location={passenger.pickup_location}
            drop_location={passenger.drop_location}
            is_regular={passenger.is_regular}
            onEdit={() => handleOpenSheet(passenger)}
            onDelete={() => setDeletingPassenger(passenger)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      <PageHeader
        title="Clients"
        subtitle={`${passengers.length} total`}
        variant="card"
        showBack={false}
        icon={<Users className="w-6 h-6 text-primary" />}
        rightContent={
          <Button size="sm" onClick={() => handleOpenSheet()}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      >
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="h-12 text-base pl-10 rounded-xl"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-11">
            <TabsTrigger value="regular" className="flex-1 text-sm">
              <Users className="w-4 h-4 mr-1.5" />
              Regular ({regularPassengers.length})
            </TabsTrigger>
            <TabsTrigger value="random" className="flex-1 text-sm">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Random ({randomPassengers.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {/* Passengers List */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'regular' && renderPassengerList(
          regularPassengers, 
          'No regular clients yet',
          <Users className="w-10 h-10 text-muted-foreground" />
        )}
        {activeTab === 'random' && renderPassengerList(
          randomPassengers, 
          'No random clients yet',
          <UserPlus className="w-10 h-10 text-muted-foreground" />
        )}
      </main>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl flex flex-col">
          <SheetHeader className="pb-4 flex-shrink-0">
            <SheetTitle className="text-2xl font-bold">
              {editingPassenger ? 'Edit Client' : 'Add Client'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {/* Client Type Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <Label className="text-base font-semibold">Regular Client</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_regular ? 'Permanent/recurring client' : 'One-time pickup'}
                </p>
              </div>
              <Switch
                checked={formData.is_regular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_regular: checked })}
              />
            </div>

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
              disabled={formLoading || !formData.name || !formData.phone || !formData.pickup_location || !formData.drop_location}
            >
              {formLoading ? 'Saving...' : editingPassenger ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPassenger} onOpenChange={(open) => !open && setDeletingPassenger(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Client?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <strong>{deletingPassenger?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="flex-1 h-12 bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default PassengersPage;

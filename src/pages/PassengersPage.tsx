import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, User, Phone, MapPin, Building, Search, Trash2, Edit, Users, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  const navigate = useNavigate();
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

  // Separate regular and random passengers
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
          <div key={passenger.id} className="card-warm animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  passenger.is_regular ? "bg-primary/10" : "bg-warning/10"
                )}>
                  {passenger.is_regular ? (
                    <Users className="w-6 h-6 text-primary" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-warning" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground truncate">
                      {passenger.name}
                    </h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-semibold",
                      passenger.is_regular ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                    )}>
                      {passenger.is_regular ? 'Regular' : 'Random'}
                    </span>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {passenger.phone}
                  </p>
                  {passenger.profession && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {passenger.profession}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleOpenSheet(passenger)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive"
                  onClick={() => setDeletingPassenger(passenger)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="w-3 h-3 text-success" />
                <span className="truncate">{passenger.pickup_location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 text-destructive" />
                <span className="truncate">{passenger.drop_location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="bg-card border-b border-border px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Clients</h1>
          </div>
          <Button size="sm" onClick={() => handleOpenSheet()}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="input-elderly pl-12"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12">
            <TabsTrigger value="regular" className="flex-1 text-base">
              <Users className="w-4 h-4 mr-2" />
              Regular ({regularPassengers.length})
            </TabsTrigger>
            <TabsTrigger value="random" className="flex-1 text-base">
              <UserPlus className="w-4 h-4 mr-2" />
              Random ({randomPassengers.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Passengers List */}
      <main className="px-5 py-6">
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
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-2xl font-bold">
              {editingPassenger ? 'Edit Client' : 'Add Client'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto pb-6">
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

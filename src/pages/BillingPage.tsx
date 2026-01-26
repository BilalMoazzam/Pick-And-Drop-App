import { useState, useMemo } from 'react';
import { ArrowLeft, Receipt, Calendar, TrendingUp, MessageCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import { cn } from '@/lib/utils';

const BillingPage = () => {
  const navigate = useNavigate();
  const { rides, getEarnings, getMonthRides } = useRides();
  const { passengers } = usePassengers();
  const earnings = getEarnings();
  const monthRides = getMonthRides();

  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Calculate per-passenger billing for the current month
  const passengerBilling = useMemo(() => {
    const billing: Record<string, { name: string; rides: number; total: number; phone: string }> = {};
    
    monthRides.forEach(ride => {
      if (ride.status === 'completed') {
        const key = ride.passenger_id || ride.passenger_name;
        if (!billing[key]) {
          const passenger = passengers.find(p => p.id === ride.passenger_id);
          billing[key] = {
            name: ride.passenger_name,
            rides: 0,
            total: 0,
            phone: passenger?.phone || '',
          };
        }
        billing[key].rides += 1;
        billing[key].total += Number(ride.fare);
      }
    });

    return Object.values(billing).sort((a, b) => b.total - a.total);
  }, [monthRides, passengers]);

  const handleSendWhatsApp = (name: string, phone: string, rides: number, total: number) => {
    const message = encodeURIComponent(
      `🚗 Monthly Bill - ${currentMonth}\n\n` +
      `Dear ${name},\n\n` +
      `Total Rides: ${rides}\n` +
      `Total Amount: SAR ${total.toFixed(2)}\n\n` +
      `Thank you for using our service!\n` +
      `- Pick & Drop Service`
    );
    
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Passenger', 'Rides', 'Total (SAR)'];
    const rows = passengerBilling.map(b => [b.name, b.rides, b.total]);
    
    const csvContent = [
      `Monthly Billing Report - ${currentMonth}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `Total Earnings: SAR ${earnings.month}`,
      `Total Rides: ${monthRides.filter(r => r.status === 'completed').length}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-${format(new Date(), 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-muted-foreground">{currentMonth}</p>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={TrendingUp}
            label="Month Rides"
            value={monthRides.filter(r => r.status === 'completed').length}
            variant="primary"
          />
          <StatCard
            icon={Receipt}
            label="Month Earnings"
            value={`SAR ${earnings.month}`}
            variant="success"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Passenger Bills</h2>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {passengerBilling.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No completed rides
            </h3>
            <p className="text-muted-foreground">
              Complete some rides to see billing
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passengerBilling.map((bill, index) => (
              <div key={index} className="card-warm animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{bill.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {bill.rides} ride{bill.rides !== 1 ? 's' : ''} this month
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-success">
                    SAR {bill.total.toFixed(0)}
                  </span>
                </div>
                
                {bill.phone && (
                  <Button
                    variant="outline"
                    className="w-full border-success text-success hover:bg-success/10"
                    onClick={() => handleSendWhatsApp(bill.name, bill.phone, bill.rides, bill.total)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Bill via WhatsApp
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Monthly Summary */}
        <div className="mt-8 p-5 rounded-2xl gradient-primary text-primary-foreground">
          <h3 className="font-bold text-lg mb-3">Monthly Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Rides</span>
              <span className="font-bold">{monthRides.filter(r => r.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Passengers</span>
              <span className="font-bold">{passengerBilling.length}</span>
            </div>
            <div className="flex justify-between text-xl pt-2 border-t border-primary-foreground/20">
              <span>Total Earnings</span>
              <span className="font-bold">SAR {earnings.month.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BillingPage;

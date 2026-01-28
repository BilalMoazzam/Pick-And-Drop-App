import { useState, useMemo } from 'react';
import { ArrowLeft, Receipt, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { BillingCard } from '@/components/BillingCard';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillingPage = () => {
  const navigate = useNavigate();
  const { rides, getEarnings, getMonthRides } = useRides();
  const { passengers } = usePassengers();
  const earnings = getEarnings();
  const monthRides = getMonthRides();

  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Calculate per-passenger billing for the current month with ride details
  const passengerBilling = useMemo(() => {
    const billing: Record<string, { 
      name: string; 
      rides: number; 
      total: number; 
      phone: string;
      rideDetails: Array<{ date: string; fare: number; attendance: string }>;
    }> = {};
    
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
            rideDetails: [],
          };
        }
        billing[key].rides += 1;
        billing[key].total += Number(ride.fare);
        billing[key].rideDetails.push({
          date: format(new Date(ride.pickup_time), 'dd MMM'),
          fare: Number(ride.fare),
          attendance: ride.attendance || 'present',
        });
      }
    });

    return Object.values(billing).sort((a, b) => b.total - a.total);
  }, [monthRides, passengers]);

  const handleSendWhatsApp = (name: string, phone: string, rideDetails: Array<{ date: string; fare: number; attendance: string }>, total: number) => {
    // Build detailed ride breakdown
    const rideBreakdown = rideDetails
      .filter(r => r.attendance === 'present')
      .map(r => `   📅 ${r.date} → SAR ${r.fare.toFixed(0)}`)
      .join('\n');
    
    const absentDays = rideDetails.filter(r => r.attendance === 'absent');
    const absentSection = absentDays.length > 0 
      ? `\n\n❌ Absent Days:\n${absentDays.map(r => `   ${r.date}`).join('\n')}`
      : '';

    const message = encodeURIComponent(
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🚗 *MONTHLY BILL*\n` +
      `📆 ${currentMonth}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *${name}*\n\n` +
      `📋 *Ride Details:*\n` +
      `${rideBreakdown}` +
      `${absentSection}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ Total Rides: ${rideDetails.filter(r => r.attendance === 'present').length}\n` +
      `💰 *Total Amount: SAR ${total.toFixed(0)}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Thank you for choosing us! 🙏\n` +
      `_Pick & Drop Service_ 🚙`
    );
    
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Monthly Billing Report', 14, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(currentMonth, 14, 28);
    
    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 14, 42);
    
    doc.setFontSize(11);
    doc.text(`Total Rides: ${monthRides.filter(r => r.status === 'completed').length}`, 14, 50);
    doc.text(`Total Passengers: ${passengerBilling.length}`, 14, 57);
    doc.text(`Total Earnings: SAR ${earnings.month.toFixed(0)}`, 14, 64);
    
    // Passenger Billing Table
    doc.setFontSize(14);
    doc.text('Passenger Bills', 14, 80);
    
    const tableData = passengerBilling.map(bill => [
      bill.name,
      bill.phone || '-',
      bill.rides.toString(),
      `SAR ${bill.total.toFixed(0)}`,
    ]);
    
    autoTable(doc, {
      startY: 85,
      head: [['Client Name', 'Phone', 'Rides', 'Total']],
      body: tableData,
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
    
    // Detailed breakdown for each passenger
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    passengerBilling.forEach((bill, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${bill.name}`, 14, yPos);
      yPos += 7;
      
      const detailData = bill.rideDetails.map(detail => [
        detail.date,
        detail.attendance === 'present' ? 'Present' : 'Absent',
        detail.attendance === 'present' ? `SAR ${detail.fare.toFixed(0)}` : '-',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Status', 'Fare']],
        body: detailData,
        headStyles: {
          fillColor: [100, 116, 139],
          textColor: 255,
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 9,
        },
        margin: { left: 14, right: 14 },
        tableWidth: 100,
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text(`Total: SAR ${bill.total.toFixed(0)}`, 14, yPos);
      yPos += 15;
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Pick & Drop Service - Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290);
    }
    
    doc.save(`billing-${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      {/* Header */}
      <header className="gradient-warm px-5 pt-6 pb-8 flex-shrink-0">
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

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Passenger Bills</h2>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="w-4 h-4" />
            Export PDF
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
          <div className="space-y-4">
            {passengerBilling.map((bill, index) => (
              <BillingCard
                key={index}
                name={bill.name}
                phone={bill.phone}
                rides={bill.rides}
                total={bill.total}
                rideDetails={bill.rideDetails}
                currentMonth={currentMonth}
                onSendWhatsApp={() => handleSendWhatsApp(bill.name, bill.phone, bill.rideDetails, bill.total)}
              />
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

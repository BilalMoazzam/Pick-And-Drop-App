import { useState, useMemo } from 'react';
import { Receipt, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { BillingCard } from '@/components/BillingCard';
import { PageHeader } from '@/components/PageHeader';
import { useRides } from '@/hooks/useRides';
import { usePassengers } from '@/hooks/usePassengers';
import { formatSar } from '@/lib/currency';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillingPage = () => {
  const { rides, getEarnings, getMonthRides } = useRides();
  const { passengers } = usePassengers();
  const earnings = getEarnings();
  const monthRides = getMonthRides();

  const currentMonth = format(new Date(), 'MMMM yyyy');

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


  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Modern header with warm gradient effect
    doc.setFillColor(249, 115, 22); // Orange primary
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Accent stripe
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 55, pageWidth, 4, 'F');
    
    // Company branding
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PICK & DROP SERVICE', 14, 15);
    
    // Report title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('BILLING REPORT', 14, 38);
    
    // Report details on right
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(`Period: ${currentMonth}`, pageWidth - 14, 28, { align: 'right' });
    doc.text(`Report #${format(new Date(), 'yyyyMM')}`, pageWidth - 14, 36, { align: 'right' });
    
    // Summary Stats Section
    doc.setFillColor(254, 243, 235);
    doc.roundedRect(14, 68, pageWidth - 28, 30, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('SUMMARY', 20, 78);
    
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const completedRides = monthRides.filter(r => r.status === 'completed').length;
    doc.text(`Total Rides: ${completedRides}`, 20, 88);
    doc.text(`Total Clients: ${passengerBilling.length}`, 80, 88);
    
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.text(`Total Earnings: SAR ${earnings.month.toFixed(0)}`, 140, 88);
    
    // Client Bills Table
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('CLIENT BILLS', 14, 112);
    
    const tableData = passengerBilling.map((bill, index) => [
      (index + 1).toString(),
      bill.name,
      bill.phone || '-',
      bill.rides.toString(),
      `SAR ${bill.total.toFixed(0)}`,
    ]);
    
    autoTable(doc, {
      startY: 118,
      head: [['#', 'Client Name', 'Phone', 'Rides', 'Amount']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: [250, 250, 250],
        textColor: [100, 100, 100],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 6,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 45 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' },
      },
      styles: {
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
      },
      margin: { left: 14, right: 14 },
    });
    
    // Detailed breakdown for each passenger on new pages
    let currentY = (doc as any).lastAutoTable.finalY + 20;
    
    passengerBilling.forEach((bill, index) => {
      // Check if we need a new page
      if (currentY > 220) {
        doc.addPage();
        currentY = 25;
      }
      
      // Client header
      doc.setFillColor(249, 115, 22);
      doc.roundedRect(14, currentY, pageWidth - 28, 18, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${bill.name}`, 20, currentY + 12);
      doc.text(`Total: SAR ${bill.total.toFixed(0)}`, pageWidth - 20, currentY + 12, { align: 'right' });
      
      currentY += 24;
      
      const detailData = bill.rideDetails.map((detail, idx) => [
        (idx + 1).toString(),
        detail.date,
        detail.attendance === 'present' ? 'Present' : 'Absent',
        detail.attendance === 'present' ? `SAR ${detail.fare.toFixed(0)}` : '-',
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Date', 'Status', 'Fare']],
        body: detailData,
        theme: 'plain',
        headStyles: {
          fillColor: [254, 243, 235],
          textColor: [100, 100, 100],
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [60, 60, 60],
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 20, right: 20 },
        tableWidth: pageWidth - 60,
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    });
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 280, pageWidth, 17, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Pick & Drop Service | Professional Transportation', 14, 288);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 288, { align: 'center' });
      doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth - 14, 288, { align: 'right' });
    }
    
    doc.save(`billing-report-${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom flex flex-col">
      <PageHeader
        title="Billing"
        subtitle={currentMonth}
        showBack={false}
        icon={<FileText className="w-6 h-6 text-primary" />}
      >
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
            value={formatSar(earnings.month)}
            variant="success"
          />
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Passenger Bills</h2>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="w-4 h-4" />
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
              <span className="font-bold">{formatSar(earnings.month)}</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BillingPage;

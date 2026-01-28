import { useState } from 'react';
import { ChevronDown, MessageCircle, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface RideDetail {
  date: string;
  fare: number;
  attendance: string;
}

interface BillingCardProps {
  name: string;
  phone: string;
  rides: number;
  total: number;
  rideDetails: RideDetail[];
  onSendWhatsApp: () => void;
  currentMonth: string;
}

export function BillingCard({ name, phone, rides, total, rideDetails, onSendWhatsApp, currentMonth }: BillingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const presentRides = rideDetails.filter(r => r.attendance === 'present');
  const absentRides = rideDetails.filter(r => r.attendance === 'absent');

  // Show first 3 rides when collapsed
  const previewRides = presentRides.slice(0, 3);
  const hasMoreRides = presentRides.length > 3;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header with gradient effect
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('Monthly Bill', 14, 25);
    
    // Month
    doc.setFontSize(12);
    doc.text(currentMonth, 14, 35);
    
    // Client Info Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 55, 182, 35, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(name, 20, 70);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Phone: ${phone || 'N/A'}`, 20, 80);
    
    // Ride Details Table
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Ride Details', 14, 105);
    
    const tableData = rideDetails.map(detail => [
      detail.date,
      detail.attendance === 'present' ? '✓ Present' : '✗ Absent',
      detail.attendance === 'present' ? `SAR ${detail.fare.toFixed(0)}` : '-',
    ]);
    
    autoTable(doc, {
      startY: 110,
      head: [['Date', 'Status', 'Fare']],
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
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
      },
    });
    
    // Summary Box
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(14, finalY, 182, 30, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Rides: ${presentRides.length}`, 20, finalY + 12);
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Amount: SAR ${total.toFixed(0)}`, 20, finalY + 23);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')} • Pick & Drop Service`, 14, 285);
    
    doc.save(`${name.replace(/\s+/g, '_')}-bill-${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-fade-in">
      {/* Header - Always Visible */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {rides} ride{rides !== 1 ? 's' : ''} this month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-success whitespace-nowrap">
              SAR {total.toFixed(0)}
            </span>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-muted transition-transform duration-300",
              isExpanded && "rotate-180"
            )}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Preview - Only when collapsed */}
        {!isExpanded && previewRides.length > 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Rides:</p>
            <div className="space-y-1">
              {previewRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">📅 {detail.date}</span>
                  <span className="font-semibold">SAR {detail.fare.toFixed(0)}</span>
                </div>
              ))}
              {hasMoreRides && (
                <p className="text-xs text-primary font-medium mt-1">
                  + {presentRides.length - 3} more rides...
                </p>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Expanded Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4 space-y-3">
          {/* All Rides */}
          <div className="p-3 bg-muted/50 rounded-xl max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">All Rides:</p>
            <div className="space-y-1">
              {presentRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">📅 {detail.date}</span>
                  <span className="font-semibold text-success">SAR {detail.fare.toFixed(0)}</span>
                </div>
              ))}
            </div>
            
            {absentRides.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-destructive mb-2">Absent Days:</p>
                <div className="space-y-1">
                  {absentRides.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-destructive/70">
                      <span>❌ {detail.date}</span>
                      <span className="line-through">SAR {detail.fare.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground">Total ({presentRides.length} rides)</p>
              <p className="text-2xl font-bold text-success">SAR {total.toFixed(0)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleExportPDF();
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            {phone && (
              <Button
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendWhatsApp();
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

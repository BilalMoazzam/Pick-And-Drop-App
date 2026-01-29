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
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Modern header with warm gradient effect
    doc.setFillColor(249, 115, 22); // Orange primary
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Accent stripe
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 50, pageWidth, 4, 'F');
    
    // Company branding
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PICK & DROP SERVICE', 14, 15);
    
    // Invoice title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', 14, 35);
    
    // Invoice details on right
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(`Period: ${currentMonth}`, pageWidth - 14, 28, { align: 'right' });
    doc.text(`Invoice #${format(new Date(), 'yyyyMM')}`, pageWidth - 14, 36, { align: 'right' });
    
    // Bill To section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('BILL TO', 14, 68);
    
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(name, 14, 78);
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Phone: ${phone || 'N/A'}`, 14, 86);
    
    // Separator line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 94, pageWidth - 14, 94);
    
    // Ride Details Table
    const tableData = rideDetails.map((detail, index) => [
      (index + 1).toString(),
      detail.date,
      detail.attendance === 'present' ? 'Present' : 'Absent',
      detail.attendance === 'present' ? `SAR ${detail.fare.toFixed(0)}` : '-',
    ]);
    
    autoTable(doc, {
      startY: 100,
      head: [['#', 'Date', 'Status', 'Amount']],
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
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 50, halign: 'center' },
        3: { cellWidth: 40, halign: 'right' },
      },
      styles: {
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
      },
      margin: { left: 14, right: 14 },
    });
    
    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Summary box
    doc.setFillColor(254, 243, 235); // Light orange background
    doc.roundedRect(pageWidth - 100, finalY, 86, 45, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Rides:', pageWidth - 94, finalY + 14);
    doc.text('Subtotal:', pageWidth - 94, finalY + 26);
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(presentRides.length.toString(), pageWidth - 20, finalY + 14, { align: 'right' });
    doc.text(`SAR ${total.toFixed(0)}`, pageWidth - 20, finalY + 26, { align: 'right' });
    
    // Total line
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 94, finalY + 32, pageWidth - 20, finalY + 32);
    
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.text('TOTAL:', pageWidth - 94, finalY + 42);
    doc.setFontSize(14);
    doc.text(`SAR ${total.toFixed(0)}`, pageWidth - 20, finalY + 42, { align: 'right' });
    
    // Thank you note
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Pick & Drop Service!', 14, finalY + 25);
    
    // Footer
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 280, pageWidth, 17, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Pick & Drop Service | Professional Transportation', 14, 288);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth - 14, 288, { align: 'right' });
    
    doc.save(`${name.replace(/\s+/g, '_')}-invoice-${format(new Date(), 'yyyy-MM')}.pdf`);
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

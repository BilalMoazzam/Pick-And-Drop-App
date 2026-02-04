import { useMemo, useState } from 'react';
import { ChevronDown, FileText, Loader2, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatSar, formatSarText } from '@/lib/currency';

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
  currentMonth: string;
}

export function BillingCard({ name, phone, rides, total, rideDetails, currentMonth }: BillingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareHelpOpen, setShareHelpOpen] = useState(false);

  const presentRides = rideDetails.filter(r => r.attendance === 'present');
  const absentRides = rideDetails.filter(r => r.attendance === 'absent');

  const previewRides = presentRides.slice(0, 3);
  const hasMoreRides = presentRides.length > 3;

  const buildFileName = () => `${name.replace(/\s+/g, '_')}-invoice-${format(new Date(), 'yyyy-MM')}.pdf`;

  const downloadPdf = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Mobile browsers may start the download after a delay.
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const generatePDFBlob = (): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 50, pageWidth, 4, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PICK & DROP SERVICE', 14, 15);
    
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', 14, 35);
    
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(`Period: ${currentMonth}`, pageWidth - 14, 28, { align: 'right' });
    doc.text(`Invoice #${format(new Date(), 'yyyyMM')}`, pageWidth - 14, 36, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('BILL TO', 14, 68);
    
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(name, 14, 78);
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Phone: ${phone || 'N/A'}`, 14, 86);
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 94, pageWidth - 14, 94);
    
    const tableData = rideDetails.map((detail, index) => [
      (index + 1).toString(),
      detail.date,
      detail.attendance === 'present' ? 'Present' : 'Absent',
      detail.attendance === 'present' ? formatSarText(detail.fare) : '-',
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
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(254, 243, 235);
    doc.roundedRect(pageWidth - 100, finalY, 86, 45, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Rides:', pageWidth - 94, finalY + 14);
    doc.text('Subtotal:', pageWidth - 94, finalY + 26);
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(presentRides.length.toString(), pageWidth - 20, finalY + 14, { align: 'right' });
    doc.text(formatSarText(total), pageWidth - 20, finalY + 26, { align: 'right' });
    
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 94, finalY + 32, pageWidth - 20, finalY + 32);
    
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.text('TOTAL:', pageWidth - 94, finalY + 42);
    doc.setFontSize(14);
    doc.text(formatSarText(total), pageWidth - 20, finalY + 42, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Pick & Drop Service!', 14, finalY + 25);
    
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 280, pageWidth, 17, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Pick & Drop Service | Professional Transportation', 14, 288);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth - 14, 288, { align: 'right' });
    
    return doc.output('blob');
  };

  const handleExportPDF = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const blob = generatePDFBlob();
    downloadPdf(blob, buildFileName());
    toast.success('PDF downloaded');
  };

  const handleShareWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    const toastId = toast.loading('Preparing invoice…');

    try {
      const blob = generatePDFBlob();
      const fileName = buildFileName();
      const file = new File([blob], fileName, { type: 'application/pdf' });

      const navAny = navigator as any;
      const supportsShare = typeof navAny?.share === 'function';
      const supportsFileShare = typeof navAny?.canShare === 'function' ? navAny.canShare({ files: [file] }) : true;

      if (supportsShare && supportsFileShare) {
        try {
          await navAny.share({
            files: [file],
            title: `Invoice - ${name}`,
            text: `Invoice for ${name} (${currentMonth})`,
          });
          toast.success('Shared successfully!', { id: toastId });
          return;
        } catch (shareError: any) {
          if (shareError?.name === 'AbortError') {
            toast.dismiss(toastId);
            return;
          }
          console.log('Direct share failed, falling back to download + WhatsApp link');
        }
      }

      // Fallback: auto-download the PDF (reliable) + open WhatsApp with the message.
      downloadPdf(blob, fileName);

      const waWindow = window.open(whatsappPrefillUrl, '_blank', 'noopener,noreferrer');
      if (!waWindow) {
        setShareHelpOpen(true);
      }

      toast.success('PDF downloaded — attach it in WhatsApp', { id: toastId });
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Could not prepare invoice', { id: toastId });
      setShareHelpOpen(true);
    } finally {
      setIsSharing(false);
    }
  };

  const whatsappMessage = useMemo(() => {
    return `Invoice PDF for ${name} (${currentMonth}).\n\nIf the PDF didn't attach automatically, please download it from the app and attach it in WhatsApp.`;
  }, [currentMonth, name]);

  const whatsappPrefillUrl = useMemo(() => {
    return `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  }, [whatsappMessage]);

  return (
    <>
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-fade-in">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {rides} ride{rides !== 1 ? 's' : ''} this month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-success whitespace-nowrap">
              {formatSar(total)}
            </span>
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center bg-muted transition-transform duration-300",
              isExpanded && "rotate-180"
            )}>
              <ChevronDown className="w-4 h-4 text-foreground" />
            </div>
          </div>
        </div>

        {!isExpanded && previewRides.length > 0 && (
          <div className="mt-3 p-3 bg-muted rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Rides:</p>
            <div className="space-y-1">
              {previewRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">📅 {detail.date}</span>
                  <span className="font-semibold text-foreground">{formatSar(detail.fare)}</span>
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

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4 space-y-3">
          <div className="p-3 bg-muted rounded-xl max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">All Rides:</p>
            <div className="space-y-1">
              {presentRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">📅 {detail.date}</span>
                  <span className="font-semibold text-success">{formatSar(detail.fare)}</span>
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
                      <span className="line-through">{formatSar(detail.fare)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground">Total ({presentRides.length} rides)</p>
              <p className="text-2xl font-bold text-success">{formatSar(total)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={handleExportPDF}
            >
              <FileText className="w-5 h-5 mr-2" />
              PDF
            </Button>
            <Button
              className="flex-1 h-12 bg-success text-success-foreground hover:bg-success/90"
              onClick={handleShareWhatsApp}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5 mr-2" />
              )}
              {isSharing ? 'Preparing…' : 'WhatsApp'}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Dialog open={shareHelpOpen} onOpenChange={setShareHelpOpen}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-2xl p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg">Share Invoice</DialogTitle>
          <DialogDescription className="text-sm">
              Some phones block direct PDF sharing. The invoice will be downloaded, then you can attach it in WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <div className="text-sm">
              <p className="font-medium">Download the PDF</p>
              <p className="text-muted-foreground text-xs">Save the invoice to your device</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <div className="text-sm">
              <p className="font-medium">Open WhatsApp</p>
              <p className="text-muted-foreground text-xs">Attach the PDF from downloads</p>
            </div>
          </div>
        </div>
        <div className="grid gap-2 mt-3">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleExportPDF();
              toast.success('PDF downloaded — now attach it in WhatsApp');
            }}
            className="h-12"
          >
            <FileText className="w-5 h-5 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setShareHelpOpen(false);
              window.open(whatsappPrefillUrl, '_blank', 'noopener,noreferrer');
            }}
            className="h-12"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Open WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

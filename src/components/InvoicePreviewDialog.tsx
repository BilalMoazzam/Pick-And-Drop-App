 import { useState, useMemo, useEffect } from 'react';
 import { FileText, MessageCircle, Loader2, Download, X, Eye } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import jsPDF from 'jspdf';
 import autoTable from 'jspdf-autotable';
 import { format } from 'date-fns';
 import { toast } from 'sonner';
 import { formatSar, formatSarText } from '@/lib/currency';
 import { motion, AnimatePresence } from 'framer-motion';
 
 interface RideDetail {
   date: string;
   fare: number;
   attendance: string;
 }
 
 interface InvoicePreviewDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   name: string;
   phone: string;
   total: number;
   rideDetails: RideDetail[];
   currentMonth: string;
 }
 
 export function InvoicePreviewDialog({
   open,
   onOpenChange,
   name,
   phone,
   total,
   rideDetails,
   currentMonth,
 }: InvoicePreviewDialogProps) {
   const [isSharing, setIsSharing] = useState(false);
   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
 
   const presentRides = rideDetails.filter(r => r.attendance === 'present');
   const absentRides = rideDetails.filter(r => r.attendance === 'absent');
 
   const buildFileName = () => `${name.replace(/\s+/g, '_')}-invoice-${format(new Date(), 'yyyy-MM')}.pdf`;
 
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
 
   // Generate PDF preview when dialog opens
   useEffect(() => {
     if (open) {
       const blob = generatePDFBlob();
       const url = URL.createObjectURL(blob);
       setPdfUrl(url);
       return () => {
         URL.revokeObjectURL(url);
         setPdfUrl(null);
       };
     }
   }, [open, name, phone, total, rideDetails, currentMonth]);
 
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
     window.setTimeout(() => URL.revokeObjectURL(url), 30000);
   };
 
   const handleDownload = () => {
     const blob = generatePDFBlob();
     downloadPdf(blob, buildFileName());
     toast.success('PDF downloaded');
   };
 
   const whatsappMessage = useMemo(() => {
     return `Invoice PDF for ${name} (${currentMonth}).\n\nIf the PDF didn't attach automatically, please download it from the app and attach it in WhatsApp.`;
   }, [currentMonth, name]);
 
   const whatsappPrefillUrl = useMemo(() => {
     return `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
   }, [whatsappMessage]);
 
   const handleShareWhatsApp = async () => {
     if (isSharing) return;
 
     setIsSharing(true);
     const toastId = toast.loading('Preparing to share…');
 
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
           onOpenChange(false);
           return;
         } catch (shareError: any) {
           if (shareError?.name === 'AbortError') {
             toast.dismiss(toastId);
             return;
           }
           console.log('Direct share failed, falling back to download + WhatsApp link');
         }
       }
 
       // Fallback: download the PDF + open WhatsApp
       downloadPdf(blob, fileName);
       window.open(whatsappPrefillUrl, '_blank', 'noopener,noreferrer');
       toast.success('PDF downloaded — attach it in WhatsApp', { id: toastId });
     } catch (error) {
       console.error('Share failed:', error);
       toast.error('Could not prepare invoice', { id: toastId });
     } finally {
       setIsSharing(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="w-[calc(100vw-24px)] max-w-md h-[85vh] max-h-[700px] rounded-2xl p-0 overflow-hidden flex flex-col">
         {/* Header */}
         <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <FileText className="w-5 h-5 text-primary" />
             </div>
             <div>
               <h2 className="font-bold text-foreground">{name}</h2>
               <p className="text-sm text-muted-foreground">{currentMonth}</p>
             </div>
           </div>
           <button
             onClick={() => onOpenChange(false)}
             className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
           >
             <X className="w-4 h-4" />
           </button>
         </div>
 
         {/* Invoice Summary Card */}
         <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-success/5">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-muted-foreground">Total Amount</p>
               <p className="text-2xl font-bold text-success">{formatSar(total)}</p>
             </div>
             <div className="text-right">
               <p className="text-sm text-muted-foreground">{presentRides.length} Rides</p>
               {absentRides.length > 0 && (
                 <p className="text-xs text-destructive">{absentRides.length} Absent</p>
               )}
             </div>
           </div>
         </div>
 
         {/* PDF Preview */}
         <div className="flex-1 bg-muted/30 overflow-hidden relative">
           {pdfUrl ? (
             <iframe
               src={pdfUrl}
               className="w-full h-full border-0"
               title="Invoice Preview"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center">
               <div className="text-center">
                 <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                 <p className="text-sm text-muted-foreground">Generating preview...</p>
               </div>
             </div>
           )}
           
           {/* Overlay hint for mobile */}
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border">
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <Eye className="w-3 h-3" />
               Scroll to view full invoice
             </p>
           </div>
         </div>
 
         {/* Action Buttons */}
         <div className="p-4 border-t border-border bg-card space-y-3 safe-bottom">
           <Button
             size="lg"
             className="w-full h-14 text-lg bg-success hover:bg-success/90 text-success-foreground shadow-lg"
             onClick={handleShareWhatsApp}
             disabled={isSharing}
           >
             {isSharing ? (
               <>
                 <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                 Preparing...
               </>
             ) : (
               <>
                 <MessageCircle className="w-6 h-6 mr-2" />
                 Share via WhatsApp
               </>
             )}
           </Button>
           
           <Button
             variant="outline"
             size="lg"
             className="w-full h-12"
             onClick={handleDownload}
           >
             <Download className="w-5 h-5 mr-2" />
             Download PDF
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }
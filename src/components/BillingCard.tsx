import { useMemo, useState } from 'react';
import { ChevronDown, Eye, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatSar, formatSarText } from '@/lib/currency';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';

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
  const [previewOpen, setPreviewOpen] = useState(false);

  const presentRides = rideDetails.filter(r => r.attendance === 'present');
  const absentRides = rideDetails.filter(r => r.attendance === 'absent');

  const previewRides = presentRides.slice(0, 3);
  const hasMoreRides = presentRides.length > 3;
  
  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

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

          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90"
            onClick={handleOpenPreview}
          >
            <Eye className="w-5 h-5 mr-2" />
            View Invoice & Share
          </Button>
        </div>
      </div>
    </div>

    <InvoicePreviewDialog
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      name={name}
      phone={phone}
      total={total}
      rideDetails={rideDetails}
      currentMonth={currentMonth}
    />
    </>
  );
}

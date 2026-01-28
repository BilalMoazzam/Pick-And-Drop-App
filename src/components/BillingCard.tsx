import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
}

export function BillingCard({ name, phone, rides, total, rideDetails, onSendWhatsApp }: BillingCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presentRides = rideDetails.filter(r => r.attendance === 'present');
  const absentRides = rideDetails.filter(r => r.attendance === 'absent');

  // Show first 3 rides when collapsed
  const previewRides = presentRides.slice(0, 3);
  const hasMoreRides = presentRides.length > 3;

  return (
    <div className="card-warm animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {rides} ride{rides !== 1 ? 's' : ''} this month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-success">
                SAR {total.toFixed(0)}
              </span>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center bg-muted transition-transform",
                isOpen && "rotate-180"
              )}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Preview (always visible) */}
        {!isOpen && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Recent Rides:</p>
            <div className="space-y-1">
              {previewRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>📅 {detail.date}</span>
                  <span className="font-semibold">SAR {detail.fare.toFixed(0)}</span>
                </div>
              ))}
              {hasMoreRides && (
                <p className="text-sm text-primary font-medium mt-2">
                  + {presentRides.length - 3} more rides...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-semibold text-muted-foreground mb-2">All Rides:</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {presentRides.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>📅 {detail.date}</span>
                  <span className="font-semibold">SAR {detail.fare.toFixed(0)}</span>
                </div>
              ))}
            </div>
            
            {absentRides.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-semibold text-destructive mb-2">Absent Days:</p>
                <div className="space-y-1">
                  {absentRides.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-destructive">
                      <span>❌ {detail.date}</span>
                      <span className="line-through">SAR {detail.fare.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>

        {phone && (
          <Button
            variant="outline"
            className="w-full border-success text-success hover:bg-success/10"
            onClick={(e) => {
              e.stopPropagation();
              onSendWhatsApp();
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Send Bill via WhatsApp
          </Button>
        )}
      </Collapsible>
    </div>
  );
}

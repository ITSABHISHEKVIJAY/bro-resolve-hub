import { useEffect, useState } from 'react';
import { Ticket } from '@/types/ticket';
import { Clock, Star } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
  const [sla, setSla] = useState<string | null>(null);

  useEffect(() => {
    if (ticket.status !== 'Resolved' && (ticket.priority === 'High' || ticket.priority === 'Critical')) {
      const hours = ticket.priority === 'Critical' ? 6 : 24;
      const deadline = ticket.timestamp + hours * 60 * 60 * 1000;
      const interval = setInterval(() => {
        const left = deadline - Date.now();
        if (left <= 0) setSla('BREACHED');
        else {
          const h = Math.floor(left / 3600000);
          const m = Math.floor((left % 3600000) / 60000);
          setSla(`${h}h ${m}m left`);
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [ticket]);

  const borderColor =
    ticket.priority === 'High' || ticket.priority === 'Critical'
      ? 'border-destructive'
      : 'border-primary/50';

  return (
    <div
      onClick={() => onClick(ticket)}
      className={`glass-panel p-4 rounded-xl cursor-pointer hover:bg-card/80 transition-all border-l-4 ${borderColor} mb-3 group relative overflow-hidden`}
    >
      {ticket.status === 'Pending' && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent -mr-8 -mt-8 rounded-full" />
      )}

      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-card rounded border border-border">
          {ticket.category}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            ticket.status === 'Resolved'
              ? 'bg-success/20 text-success'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {ticket.status}
        </span>
      </div>

      <h4 className="font-bold text-foreground text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
        {ticket.title}
      </h4>

      {sla && (
        <div
          className={`text-xs font-mono mt-2 flex items-center gap-1 ${
            sla === 'BREACHED' ? 'text-destructive animate-glow' : 'text-warning'
          }`}
        >
          <Clock className="w-3 h-3" /> SLA: {sla}
        </div>
      )}

      <div className="flex justify-between items-end mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
        <span>{new Date(ticket.timestamp).toLocaleDateString()}</span>
        <div className="text-right">
          <div>{ticket.studentName}</div>
          {ticket.rating && (
            <div className="text-warning flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> {ticket.rating}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

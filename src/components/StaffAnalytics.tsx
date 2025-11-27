import { Ticket } from '@/types/ticket';

const CATEGORIES = ['Technical', 'Curriculum', 'Facility', 'Career', 'Other'];

interface StaffAnalyticsProps {
  tickets: Ticket[];
}

export const StaffAnalytics = ({ tickets }: StaffAnalyticsProps) => {
  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const rate = total ? Math.round((resolved / total) * 100) : 0;

  const catData = CATEGORIES.map(cat => ({
    name: cat,
    count: tickets.filter(t => t.category === cat).length,
  }));
  const maxCat = Math.max(...catData.map(c => c.count)) || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="glass p-4 rounded-xl border border-primary/30">
        <h3 className="text-xs font-bold uppercase text-primary mb-4">Performance Metrics</h3>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">{resolved}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Resolved
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">{rate}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Success Rate
            </div>
          </div>
        </div>
      </div>
      <div className="glass p-4 rounded-xl border border-primary/30">
        <h3 className="text-xs font-bold uppercase text-primary mb-2">Category Volume</h3>
        <div className="space-y-2">
          {catData.map(d => (
            <div key={d.name} className="flex items-center text-xs">
              <span className="w-20 text-muted-foreground truncate">{d.name}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full mx-2">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(d.count / maxCat) * 100}%` }}
                />
              </div>
              <span className="w-4 text-right text-foreground font-mono">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

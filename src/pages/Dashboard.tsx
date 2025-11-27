import { useState, useEffect } from 'react';
import { Ticket, User, Notification } from '@/types/ticket';
import { LocalDB, exportCSV } from '@/lib/storage';
import { NotificationCenter } from '@/components/NotificationCenter';
import { StaffAnalytics } from '@/components/StaffAnalytics';
import { SettingsModal } from '@/components/SettingsModal';
import { TicketCard } from '@/components/TicketCard';
import { CreateTicketModal } from '@/components/CreateTicketModal';
import { TicketDetail } from '@/components/TicketDetail';
import { Zap, Power, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user: initialUser, onLogout }: DashboardProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [tickets, setTickets] = useState<Ticket[]>(LocalDB.loadTickets);
  const [themeKey, setThemeKey] = useState(LocalDB.getTheme());
  const [modals, setModals] = useState({ create: false, settings: false });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    LocalDB.saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    LocalDB.setTheme(themeKey);
  }, [themeKey]);

  useEffect(() => {
    if (user) LocalDB.setSession(user);
  }, [user]);

  const addNotify = (msg: string) =>
    setNotifications(p => [{ text: msg, time: Date.now(), read: false }, ...p]);

  const handleReset = () => {
    if (window.confirm('Reset all tickets and analytics? This cannot be undone.')) {
      setTickets([]);
      addNotify('All tickets cleared');
    }
  };

  const handleCreate = (data: any) => {
    const t: Ticket = {
      id: Date.now().toString(),
      ...data,
      studentName: user.displayName,
      studentId: user.name,
      status: 'Pending' as const,
      timestamp: Date.now(),
      comments: [],
    };
    setTickets(prev => [t, ...prev]);
    addNotify(`Ticket #${t.id} Created`);
  };

  const handleUpdate = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    if (selectedTicket?.id === id) setSelectedTicket(prev => (prev ? { ...prev, ...updates } : null));
    if (updates.status === 'Resolved') addNotify(`Ticket #${id} Resolved`);
  };

  const myTickets = user.role === 'student' 
    ? tickets.filter(t => t.studentId === user.name) 
    : tickets.filter(t => t.status !== 'Resolved');

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border px-6 py-3 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3 text-foreground font-bold text-xl tracking-tight">
          <Zap className="w-6 h-6 text-primary" />
          Bro<span className="text-primary">Resolve</span>
        </div>
        <div className="flex items-center gap-4">
          {user.role !== 'staff' && (
            <NotificationCenter notifications={notifications} onClear={() => setNotifications([])} />
          )}
          <button
            onClick={() => setModals({ ...modals, settings: true })}
            className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full hover:bg-muted transition border border-border"
          >
            <span className="text-xl">{user.avatar}</span>
            <span className="text-sm text-foreground hidden sm:block">{user.displayName}</span>
          </button>
          <button onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <Power className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {user.role === 'staff' && <StaffAnalytics tickets={tickets} />}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {user.role === 'staff' ? 'Ticket Queue' : 'My Requests'}
          </h2>
          {user.role === 'student' && (
            <Button onClick={() => setModals({ ...modals, create: true })} className="shadow-lg hover:scale-105 transition">
              + New Ticket
            </Button>
          )}
          {user.role === 'staff' && (
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={() => exportCSV(tickets)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['Pending', 'In Progress', 'Resolved'] as const).map(status => (
            <div
              key={status}
              className={`glass-panel p-4 rounded-xl border-t-4 ${
                status === 'Resolved' ? 'border-success' : 'border-primary'
              }`}
            >
              <h3 className="font-bold text-muted-foreground mb-4 flex justify-between">
                {status}
                <span className="bg-card px-2 rounded text-xs py-0.5">
                  {myTickets.filter(t => t.status === status).length}
                </span>
              </h3>
              <div className="space-y-3">
                {myTickets
                  .filter(t => t.status === status)
                  .map(t => (
                    <TicketCard key={t.id} ticket={t} onClick={setSelectedTicket} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={modals.create}
        onClose={() => setModals({ ...modals, create: false })}
        user={user}
        onCreate={handleCreate}
      />
      <TicketDetail
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        user={user}
        onUpdate={handleUpdate}
      />
      <SettingsModal
        isOpen={modals.settings}
        onClose={() => setModals({ ...modals, settings: false })}
        user={user}
        onSave={setUser}
        currentTheme={themeKey}
        onSetTheme={setThemeKey}
      />
    </div>
  );
}

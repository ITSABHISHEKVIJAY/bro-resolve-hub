import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/types/ticket';

interface NotificationCenterProps {
  notifications: Notification[];
  onClear: () => void;
}

export const NotificationCenter = ({ notifications, onClear }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-white animate-glow">
            {unread}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 glass border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border flex justify-between items-center bg-card/50">
            <span className="text-xs font-bold text-foreground">NOTIFICATIONS</span>
            <button
              onClick={onClear}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              CLEAR ALL
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">All caught up!</div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-3 border-b border-border/50 hover:bg-card/50 transition-colors"
                >
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.time).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

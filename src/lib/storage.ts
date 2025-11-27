import { Ticket, User } from '@/types/ticket';

const STORAGE_KEY_TICKETS = 'broResolve_tickets_v10';
const STORAGE_KEY_USER = 'broResolve_user_v10';
const STORAGE_KEY_THEME = 'broResolve_theme_v10';
const STORAGE_KEY_LIVE_USERS = 'broResolve_live_users_v10';

const defaultUsers: User[] = [
  { name: 'alex', password: 'pass', role: 'student', displayName: 'Alex Smith', avatar: '👨‍🎓' },
  { name: 'jane', password: 'pass', role: 'student', displayName: 'Jane Doe', avatar: '👩‍💻' },
  { name: 'staff1', password: 'admin', role: 'staff', displayName: 'Command Lead', avatar: '👮‍♂️' },
];

export const LocalDB = {
  loadTickets: (): Ticket[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTickets: (tickets: Ticket[]) => {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  },

  getUsers: (): User[] => defaultUsers,

  getLiveUsers: (): User[] => {
    try {
      const liveUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_LIVE_USERS) || '[]');
      const allUsers = [...defaultUsers];
      liveUsers.forEach((u: User) => {
        if (!allUsers.find(du => du.name === u.name)) {
          allUsers.push(u);
        }
      });
      return allUsers;
    } catch {
      return defaultUsers;
    }
  },

  saveNewUser: (user: User) => {
    try {
      const liveUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_LIVE_USERS) || '[]');
      localStorage.setItem(STORAGE_KEY_LIVE_USERS, JSON.stringify([...liveUsers, user]));
    } catch (e) {
      console.error('Failed to save new user', e);
    }
  },

  getSession: (): User | null => {
    try {
      const session = localStorage.getItem(STORAGE_KEY_USER);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  setSession: (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  getTheme: (): string => {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'cyan';
  },

  setTheme: (theme: string) => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  },
};

export const KNOWLEDGE_BASE = [
  { q: 'wifi', a: "Forget 'Campus-Net' and reconnect using your Student ID." },
  { q: 'vpn', a: 'Ensure Cisco AnyConnect is updated to v4.10.' },
  { q: 'printer', a: "Check if Tray 2 has paper. If error 'PC-Load-Letter', contact IT." },
  { q: 'grade', a: 'Grades are synced every Friday at 5 PM.' },
  { q: 'login', a: 'Reset your portal password at auth.university.edu.' },
];

export function mockAiPriority(text: string): { priority: string; urgency: string } {
  const t = text.toLowerCase();
  let p = 'Low',
    u = 'Standard';
  if (t.includes('urgent') || t.includes('fail') || t.includes('deadline')) p = 'High';
  if (t.includes('critical') || t.includes('broken') || t.includes('security')) p = 'Critical';
  if ((t.includes('now') || t.includes('today')) && (p === 'High' || p === 'Critical'))
    u = 'Critical';
  return { priority: p, urgency: u };
}

export function exportCSV(tickets: Ticket[]) {
  const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Student', 'Created'];
  const rows = tickets.map(t => [
    t.id,
    t.title,
    t.category,
    t.priority,
    t.status,
    t.studentName,
    new Date(t.timestamp).toLocaleDateString(),
  ]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.href = encodeURI(csvContent);
  link.download = 'bro_resolve_export.csv';
  link.click();
}

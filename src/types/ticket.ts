export type TicketStatus = 'Pending' | 'In Progress' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Technical' | 'Curriculum' | 'Facility' | 'Career' | 'Other';

export interface Attachment {
  name: string;
  type: string;
  data?: string;
}

export interface Comment {
  text: string;
  author: string;
  role: string;
  avatar: string;
  time: number;
}

export interface HistoryEntry {
  action: string;
  author: string;
  role: string;
  time: number;
  details?: string;
}

export interface Ticket {
  id: string;
  title: string;
  desc: string;
  category: TicketCategory;
  priority: TicketPriority;
  urgency?: string;
  status: TicketStatus;
  studentName: string;
  studentId: string;
  timestamp: number;
  comments: Comment[];
  attachments?: Attachment[];
  resolutionSummary?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  rating?: number;
  ratingComment?: string;
  tags?: string[];
  history?: HistoryEntry[];
}

export interface User {
  name: string;
  password: string;
  role: 'student' | 'staff';
  displayName: string;
  avatar: string;
}

export interface Notification {
  text: string;
  time: number;
  read: boolean;
}

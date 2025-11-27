import { useState, useEffect } from 'react';
import { Ticket, User } from '@/types/ticket';
import { X, Phone, Mail, CheckCircle, Send, Star, Image as ImageIcon, FileText, Tag, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface TicketDetailProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
}

export const TicketDetail = ({ ticket, isOpen, onClose, user, onUpdate }: TicketDetailProps) => {
  const [comment, setComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resSummary, setResSummary] = useState('');
  const [resolveMode, setResolveMode] = useState(false);
  const [rateMode, setRateMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [viewingFile, setViewingFile] = useState<any>(null);

  useEffect(() => {
    if (ticket) {
      setResSummary(ticket.resolutionSummary || '');
      setResolveMode(false);
      setRateMode(false);
    }
  }, [ticket?.id]);

  useEffect(() => {
    if (ticket && ticket.status !== 'Resolved') {
      const t = setTimeout(() => setIsTyping(true), 2000);
      const t2 = setTimeout(() => setIsTyping(false), 5000);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, [ticket?.id]);

  if (!isOpen || !ticket) return null;

  const sendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onUpdate(ticket.id, {
      comments: [
        ...(ticket.comments || []),
        { text: comment, author: user.displayName, role: user.role, avatar: user.avatar, time: Date.now() },
      ],
    });
    setComment('');
  };

  const confirmResolve = () => {
    if (!resSummary.trim()) return alert('Summary required!');
    onUpdate(ticket.id, {
      status: 'Resolved',
      resolutionSummary: resSummary,
      resolvedBy: user.displayName,
      resolvedAt: new Date().toISOString(),
    });
    setResolveMode(false);
  };

  const submitRating = () => {
    onUpdate(ticket.id, { rating, ratingComment: rateComment });
    setRateMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-background border-l border-border flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-background z-10">
          <div>
            <div className="text-xs font-mono text-primary mb-1">TICKET #{ticket.id}</div>
            <h2 className="text-lg font-bold text-foreground line-clamp-1">{ticket.title}</h2>
          </div>
          <button onClick={onClose}>
            <X className="text-muted-foreground hover:text-foreground text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Actions */}
          {user.role === 'staff' && ticket.status !== 'Resolved' && !resolveMode && (
            <div className="p-3 rounded-lg border border-primary/30 bg-card/50 flex gap-2">
              <Button
                onClick={() => onUpdate(ticket.id, { status: 'In Progress' })}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                In Progress
              </Button>
              <Button
                onClick={() => setResolveMode(true)}
                size="sm"
                className="flex-1 bg-success hover:bg-success/90"
              >
                Resolve
              </Button>
            </div>
          )}

          {/* Resolution */}
          {(resolveMode || ticket.status === 'Resolved') && (
            <div
              className={`p-4 rounded-xl border ${
                ticket.status === 'Resolved'
                  ? 'border-success/30 bg-success/10'
                  : 'border-purple-500/30 bg-card'
              }`}
            >
              <h3 className="text-sm font-bold text-success mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Resolution
              </h3>
              {ticket.status === 'Resolved' ? (
                <div>
                  <p className="text-sm text-foreground/80">{ticket.resolutionSummary}</p>
                  <div className="mt-3 pt-3 border-t border-success/20 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">By {ticket.resolvedBy}</span>
                    {ticket.rating ? (
                      <span className="text-warning text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" /> {ticket.rating}/5
                      </span>
                    ) : user.role === 'student' && !rateMode ? (
                      <Button
                        onClick={() => setRateMode(true)}
                        size="sm"
                        className="bg-warning text-warning-foreground hover:bg-warning/90"
                      >
                        Rate Staff
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>
                  <Textarea
                    value={resSummary}
                    onChange={e => setResSummary(e.target.value)}
                    className="bg-card border-input mb-2"
                    rows={3}
                    placeholder="Summary of fix..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={confirmResolve} size="sm" className="bg-success hover:bg-success/90">
                      Confirm
                    </Button>
                    <Button onClick={() => setResolveMode(false)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rating Input */}
          {rateMode && (
            <div className="p-4 bg-warning/20 border border-warning/30 rounded-xl">
              <h4 className="text-warning font-bold text-sm mb-2">Rate Resolution</h4>
              <div className="flex gap-2 text-xl mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className={s <= rating ? 'text-warning' : 'text-muted'}
                  >
                    <Star className={`w-5 h-5 ${s <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <Input
                className="bg-card border-input mb-2"
                placeholder="Comment..."
                value={rateComment}
                onChange={e => setRateComment(e.target.value)}
              />
              <Button onClick={submitRating} size="sm" className="bg-warning text-warning-foreground">
                Submit
              </Button>
            </div>
          )}

          {/* Staff Contact */}
          {user.role === 'staff' && (
            <div className="flex gap-2">
              <a href="#" className="flex-1 py-2 bg-card rounded border border-border text-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition flex items-center justify-center gap-2">
                <Phone className="w-3 h-3" /> Call Student
              </a>
              <a href="#" className="flex-1 py-2 bg-card rounded border border-border text-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition flex items-center justify-center gap-2">
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          )}

          {/* Issue Details */}
          <div className="bg-card/30 p-4 rounded-lg">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Issue Details</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.desc}</p>
            
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> AI-Generated Tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setViewingFile(f)}
                      className="text-[10px] bg-card px-2 py-1 rounded text-primary hover:bg-muted transition cursor-pointer border border-transparent hover:border-primary/50 flex items-center gap-1"
                    >
                      {f.data ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket History */}
          {ticket.history && ticket.history.length > 0 && (
            <div className="bg-card/30 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Ticket History
              </h4>
              <div className="space-y-3">
                {ticket.history.map((entry, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      {idx < ticket.history!.length - 1 && (
                        <div className="w-px h-full bg-border/50 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-foreground font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {entry.author} • {new Date(entry.time).toLocaleString()}
                      </p>
                      {entry.details && (
                        <p className="text-xs text-foreground/70 mt-1 italic">{entry.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">Activity Log</h4>
            <div className="space-y-4">
              {ticket.comments?.map((c, i) => (
                <div key={i} className={`flex gap-3 ${c.role === user.role ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow text-lg">
                    {c.avatar || '👤'}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      c.role === user.role
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card text-foreground rounded-tl-none'
                    }`}
                  >
                    <div className="text-[10px] opacity-75 mb-1">{c.author}</div>
                    {c.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-muted-foreground italic ml-10">User is typing...</div>}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-card border-t border-border">
          <form onSubmit={sendComment} className="flex gap-2">
            <Input
              disabled={ticket.status === 'Resolved'}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="flex-1 bg-background border-input rounded-full"
              placeholder={ticket.status === 'Resolved' ? 'Ticket Closed' : 'Type a message...'}
            />
            <Button
              disabled={ticket.status === 'Resolved'}
              type="submit"
              size="icon"
              className="rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* File Viewer */}
      {viewingFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur p-4"
          onClick={() => setViewingFile(null)}
        >
          <div
            className="bg-card p-2 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-2 border-b border-border mb-2">
              <span className="text-foreground font-mono text-sm">{viewingFile.name || viewingFile}</span>
              <button onClick={() => setViewingFile(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-background rounded flex-1 flex flex-col items-center justify-center text-muted-foreground overflow-hidden min-h-[300px]">
              {viewingFile.data && viewingFile.data.startsWith('data:image') ? (
                <img src={viewingFile.data} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <>
                  <FileText className="w-16 h-16 mb-4 text-muted" />
                  <p>Preview not available</p>
                  <p className="text-xs mt-2 text-muted-foreground">(Simulated file)</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

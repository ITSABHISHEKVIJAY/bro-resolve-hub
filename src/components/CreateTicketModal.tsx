import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/ticket';
import { KNOWLEDGE_BASE, mockAiPriority } from '@/lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Lightbulb, Paperclip, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Technical', 'Curriculum', 'Facility', 'Career', 'Other'];

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onCreate: (data: any) => void;
}

export const CreateTicketModal = ({ isOpen, onClose, user, onCreate }: CreateTicketModalProps) => {
  const [form, setForm] = useState({ title: '', desc: '', category: 'Technical', priority: 'Low' });
  const [suggestions, setSuggestions] = useState<typeof KNOWLEDGE_BASE>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (form.title.length > 2) {
      setSuggestions(KNOWLEDGE_BASE.filter(k => form.title.toLowerCase().includes(k.q)));
    } else {
      setSuggestions([]);
    }
  }, [form.title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 3000000) {
        alert('File is too large (max 3MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = event => {
        const fileData = {
          name: file.name,
          type: file.type,
          data: event.target?.result as string,
        };
        setAttachments(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // Call AI categorization
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize-ticket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: form.title,
            description: form.desc,
          }),
        }
      );

      let tags: string[] = ['Uncategorized'];
      if (response.ok) {
        const data = await response.json();
        tags = data.tags || ['Uncategorized'];
        console.log('AI-generated tags:', tags);
      }

      const ai = mockAiPriority(form.title + ' ' + form.desc);
      onCreate({ ...form, ...ai, attachments, tags });
      
      toast({
        title: "Ticket Created",
        description: `Auto-tagged as: ${tags.join(', ')}`,
      });

      onClose();
      setForm({ title: '', desc: '', category: 'Technical', priority: 'Low' });
      setAttachments([]);
    } catch (error) {
      console.error('Error creating ticket:', error);
      const ai = mockAiPriority(form.title + ' ' + form.desc);
      onCreate({ ...form, ...ai, attachments, tags: ['Uncategorized'] });
      onClose();
      setForm({ title: '', desc: '', category: 'Technical', priority: 'Low' });
      setAttachments([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Request</DialogTitle>
        </DialogHeader>

        {suggestions.length > 0 && (
          <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-sm">
            <div className="text-indigo-400 font-bold mb-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Try these first:
            </div>
            {suggestions.map((s, i) => (
              <div key={i} className="text-foreground/80">
                • {s.a}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            required
            placeholder="Issue Title (e.g. Wifi)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-card border-input"
          />
          <Textarea
            required
            rows={3}
            placeholder="Description..."
            value={form.desc}
            onChange={e => setForm({ ...form, desc: e.target.value })}
            className="bg-card border-input"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={form.category} onValueChange={cat => setForm({ ...form, category: cat })}>
              <SelectTrigger className="bg-card border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*"
            />
            <div
              className="flex items-center justify-center border border-dashed border-input rounded cursor-pointer hover:bg-card transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Attach Image
              </span>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="text-xs text-success flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <span key={i} className="bg-card px-2 py-1 rounded border border-border">
                  {f.name}
                </span>
              ))}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Analyzing & Creating...
              </>
            ) : (
              'Submit Ticket'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { User } from '@/types/ticket';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => void;
  currentTheme: string;
  onSetTheme: (theme: string) => void;
}

const THEMES = {
  cyan: { name: 'Cyber Cyan', color: 'bg-cyan-500' },
  purple: { name: 'Neon Purple', color: 'bg-purple-500' },
  green: { name: 'Matrix Green', color: 'bg-emerald-500' },
};

export const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  currentTheme,
  onSetTheme,
}: SettingsModalProps) => {
  const [form, setForm] = useState({ ...user });

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
            System Theme
          </Label>
          <div className="flex gap-3">
            {Object.entries(THEMES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onSetTheme(key)}
                className={`w-8 h-8 rounded-full ${val.color} ${currentTheme === key ? 'ring-2 ring-foreground scale-110' : 'opacity-50'} transition-all`}
                title={val.name}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">
              Display Name
            </Label>
            <Input
              className="bg-card border-input"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">
              Avatar Emoji
            </Label>
            <div className="flex gap-2">
              {['👨‍🎓', '👩‍🎓', '👮‍♂️', '👩‍💻', '👨‍💻', '🦸'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setForm({ ...form, avatar: emoji })}
                  className={`p-2 bg-card rounded ${form.avatar === emoji ? 'ring-1 ring-primary bg-muted' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

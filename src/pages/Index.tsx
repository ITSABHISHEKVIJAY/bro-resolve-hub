import { useState } from 'react';
import { User } from '@/types/ticket';
import { LocalDB } from '@/lib/storage';
import { Landing } from '@/components/Landing';
import { AuthForm } from '@/components/AuthForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Dashboard from './Dashboard';

const Index = () => {
  const [user, setUser] = useState<User | null>(LocalDB.getSession());
  const [authModal, setAuthModal] = useState<'student' | 'staff' | null>(null);

  const handleLogin = (profile: User) => {
    setUser(profile);
    LocalDB.setSession(profile);
    setAuthModal(null);
  };

  const handleLogout = () => {
    setUser(null);
    LocalDB.clearSession();
  };

  if (!user) {
    return (
      <>
        <Landing onAccess={role => setAuthModal(role)} />
        <Dialog open={!!authModal} onOpenChange={() => setAuthModal(null)}>
          <DialogContent className="glass border-border">
            {authModal && <AuthForm role={authModal} onSuccess={handleLogin} />}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default Index;

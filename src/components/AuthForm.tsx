import { useState } from 'react';
import { User } from '@/types/ticket';
import { LocalDB } from '@/lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AuthFormProps {
  role: 'student' | 'staff';
  onSuccess: (user: User) => void;
}

export const AuthForm = ({ role, onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = LocalDB.getLiveUsers();
    const found = users.find(
      u => u.name === form.name.toLowerCase() && u.password === form.password
    );

    if (isLogin) {
      if (!found) return setError('Invalid credentials');
      if (found.role !== role) return setError('Wrong portal');
      onSuccess(found);
    } else {
      if (found) return setError('Username taken');
      if (form.password.length < 4) return setError('Password too short');
      const newUser: User = {
        ...form,
        name: form.name.toLowerCase(),
        role,
        displayName: form.name,
        avatar: '👤',
      };
      LocalDB.saveNewUser(newUser);
      onSuccess(newUser);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        {isLogin ? 'Login' : 'Sign Up'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Username"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="bg-card border-input"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="bg-card border-input"
          required
        />
        {error && <p className="text-destructive text-xs text-center">{error}</p>}
        <Button type="submit" className="w-full">
          {isLogin ? 'Enter' : 'Create'}
        </Button>
      </form>
      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-center text-xs text-muted-foreground mt-4 cursor-pointer hover:text-foreground transition-colors"
      >
        {isLogin ? 'Need account? Sign Up' : 'Have account? Login'}
      </p>
    </div>
  );
};

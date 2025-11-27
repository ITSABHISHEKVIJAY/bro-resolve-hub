import { GraduationCap, UserCheck, Zap } from 'lucide-react';

interface LandingProps {
  onAccess: (role: 'student' | 'staff') => void;
}

export const Landing = ({ onAccess }: LandingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-neon/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-neon/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

      <div className="z-10 text-center glass p-8 md:p-12 rounded-3xl max-w-2xl shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-12 h-12 text-primary" />
          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Bro Resolve
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8">
          Next-gen ticket resolution system
        </p>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Student Portal */}
          <button
            onClick={() => onAccess('student')}
            className="flex-1 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 flex flex-col items-center group hover:shadow-cyan-500/20 hover:shadow-xl transition-all hover:scale-105"
          >
            <GraduationCap className="w-12 h-12 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-foreground">Student Portal</span>
            <span className="text-sm text-muted-foreground">Log in to raise requests</span>
          </button>

          {/* Staff Portal */}
          <button
            onClick={() => onAccess('staff')}
            className="flex-1 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-purple-500/30 flex flex-col items-center group hover:shadow-purple-500/20 hover:shadow-xl transition-all hover:scale-105"
          >
            <UserCheck className="w-12 h-12 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-foreground">Staff Portal</span>
            <span className="text-sm text-muted-foreground">Log in to manage tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};

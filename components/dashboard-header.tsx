'use client';

import { Button } from '@/components/ui/button';
import { User } from '@/lib/auth';

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <span className="text-sm font-bold text-accent-foreground">IT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                IP Threat Intelligence
              </h1>
              {user && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-border hover:bg-destructive/10 hover:text-destructive"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

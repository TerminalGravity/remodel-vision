import React from 'react';
import { cn } from '@remodelvision/ui';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  return (
    <div className={cn("flex h-screen w-screen bg-slate-950 text-white overflow-hidden font-sans", className)}>
      {children}
    </div>
  );
};


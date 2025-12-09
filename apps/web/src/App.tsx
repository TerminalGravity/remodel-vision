import React from 'react';
import { DollhouseViewer } from './components/canvas/DollhouseViewer';
import { Sidebar } from './components/ui/Sidebar';
import { ResultOverlay } from './components/ui/ResultOverlay';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectSettingsPage } from './components/workspace/ProjectSettings';
import { PropertyIntelligence } from './components/workspace/PropertyIntelligence';
import { useStore } from './store/useStore';
import { AppViewMode } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { cn } from '@remodelvision/ui';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div className={cn(bg, "text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in slide-in-from-bottom-5 fade-in duration-300")}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function App() {
  const { selectedRoom, notifications, removeNotification, viewMode, workspaceView } = useStore();

  return (
    <AppShell>
      {viewMode === AppViewMode.DASHBOARD ? (
        <Dashboard />
      ) : (
        <WorkspaceLayout
          mainContent={
            <>
              {workspaceView === 'DESIGN' && (
                <>
                  <DollhouseViewer />
                  {/* Floating HUD info for design mode */}
                  {selectedRoom && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 px-6 py-3 rounded-full shadow-2xl pointer-events-none flex items-center gap-3 z-10">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Selected</span>
                      <p className="text-sm font-bold text-white border-l border-slate-700 pl-3">{selectedRoom}</p>
                    </div>
                  )}
                </>
              )}
              
              {workspaceView === 'SETTINGS' && <ProjectSettingsPage />}
              {workspaceView === 'INTELLIGENCE' && <PropertyIntelligence />}
            </>
          }
          sidebar={<Sidebar />}
          overlay={<ResultOverlay />}
        />
      )}

      {/* Global Toast Container */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
        {notifications.map(n => (
          <Toast 
            key={n.id} 
            type={n.type} 
            message={n.message} 
            onClose={() => removeNotification(n.id)} 
          />
        ))}
      </div>
    </AppShell>
  );
}

export default App;

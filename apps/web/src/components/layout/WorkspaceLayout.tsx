import React from 'react';

interface WorkspaceLayoutProps {
  mainContent: React.ReactNode;
  sidebar: React.ReactNode;
  overlay?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ mainContent, sidebar, overlay }) => {
  return (
    <>
      <div className="flex-1 relative bg-slate-900 overflow-hidden">
        {mainContent}
      </div>
      {sidebar}
      {overlay}
    </>
  );
};

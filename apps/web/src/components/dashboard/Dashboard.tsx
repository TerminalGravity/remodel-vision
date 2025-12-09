import React from 'react';
import { useStore } from '../../store/useStore';
import { MapPin, Calendar, ArrowRight, Plus, Search, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Project } from '../../types';

export const Dashboard = () => {
  const { projects, setActiveProject } = useStore();

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            RemodelVision <span className="text-xs font-normal text-slate-500 px-2 border-l border-slate-700 ml-2">Enterprise</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="bg-slate-900 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-64 transition-all"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <span className="text-xs font-bold">JD</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & Actions */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
              <p className="text-slate-400">Manage your renovation properties and workspaces.</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Map / Visualization Area (Stylized) */}
          <div className="w-full h-64 rounded-2xl overflow-hidden relative bg-slate-900 border border-slate-800 group">
            {/* Abstract Map Background */}
            <div className="absolute inset-0 opacity-30 pattern-grid-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            {/* Pins */}
            {projects.map((p, i) => (
              <div 
                key={p.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                style={{ 
                  left: `${50 + (i * 15) - 15}%`, 
                  top: `${40 + (i * 10) - 10}%` 
                }}
                onClick={() => setActiveProject(p.id)}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full relative z-10 border-2 border-slate-900 shadow-lg"></div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.name}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-4 left-6">
              <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                LIVE GEO-DATA
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => setActiveProject(project.id)} />
            ))}
            
            {/* Empty State Card */}
            <button className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-all group h-full min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-slate-800 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Create Workspace</span>
              <span className="text-sm opacity-50">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  return (
    <div 
      onClick={onOpen}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          src={project.thumbnail} 
          alt={project.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
          {project.status === 'in-progress' ? 'In Progress' : project.status === 'planning' ? 'Planning' : 'Completed'}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {project.config.location.address}
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
            <span className="text-slate-500 block mb-0.5">Style</span>
            <span className="text-slate-200 font-medium truncate block">{project.config.style}</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
            <span className="text-slate-500 block mb-0.5">Budget</span>
            <span className="text-slate-200 font-medium">{project.config.budget}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
           <span className="flex items-center gap-1">
             <Calendar className="w-3 h-3" />
             {new Date(project.lastModified).toLocaleDateString()}
           </span>
           <span className="group-hover:translate-x-1 transition-transform text-blue-500 flex items-center gap-1 font-medium">
             Open Workspace <ArrowRight className="w-3 h-3" />
           </span>
        </div>
      </div>
    </div>
  );
};
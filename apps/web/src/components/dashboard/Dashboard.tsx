import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MapPin, Calendar, ArrowRight, Plus, Search, Sparkles, X } from 'lucide-react';
import { Project } from '../../types';
import { Button, Card } from '@remodelvision/ui';

export const Dashboard = () => {
  const { projects, setActiveProject, addProject } = useStore();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName || !newProjectAddress) return;

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: newProjectName,
      clientName: 'New Client',
      status: 'planning',
      lastModified: Date.now(),
      thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=600&auto=format&fit=crop',
      config: {
        style: 'Modern',
        budget: 'Standard',
        timeline: '3 Months',
        preferences: '',
        location: { address: newProjectAddress, lat: 0, lng: 0 }
      }
    };

    addProject(newProject);
    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectAddress('');
    setActiveProject(newProject.id);
  };

  return (
    <div className="w-full h-full bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Navigation - Premium Glass Header */}
      <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-xl px-8 flex items-center justify-between opacity-0 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-copper to-copper-dark rounded-xl flex items-center justify-center shadow-lg shadow-copper/20 copper-glow">
            <span className="font-display font-bold text-background text-lg">R</span>
          </div>
          <div className="flex items-center">
            <span className="font-display text-xl tracking-tight text-foreground">
              RemodelVision
            </span>
            <span className="text-[10px] font-medium text-copper ml-3 px-2 py-0.5 bg-copper/10 rounded-full border border-copper/20 uppercase tracking-widest">
              Pro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-copper transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-copper/50 focus:bg-secondary w-72 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:border-copper/30 hover:text-foreground transition-all cursor-pointer">
            <span className="text-xs font-bold">JF</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">

          {/* Hero Header with Editorial Typography */}
          <header className="flex items-end justify-between opacity-0 animate-fade-in-up">
            <div className="space-y-3">
              <p className="text-xs font-medium text-copper uppercase tracking-[0.2em]">Property Portfolio</p>
              <h1 className="font-display text-5xl text-foreground tracking-tight">
                Your Projects
              </h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Transform spaces with AI-powered visualization and intelligent property insights.
              </p>
            </div>
            <Button
              className="gap-2 bg-copper hover:bg-copper-dark text-background font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-copper/25 hover:shadow-copper/40 transition-all btn-press opacity-0 animate-fade-in animate-delay-200"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </header>

          {/* Featured Project Hero - Editorial Layout */}
          {projects.length > 0 && (
            <div
              onClick={() => setActiveProject(projects[0].id)}
              className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group opacity-0 animate-fade-in-up animate-delay-100"
            >
              {/* Background Image with Premium Overlay */}
              <img
                src={projects[0].thumbnail}
                alt={projects[0].name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="max-w-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-copper bg-copper/10 px-2.5 py-1 rounded-full border border-copper/20 uppercase tracking-widest">
                      Featured
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      {projects[0].status === 'in-progress' ? 'In Progress' : projects[0].status === 'planning' ? 'Planning' : 'Completed'}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl text-foreground">{projects[0].name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-copper" />
                    {projects[0].config.location.address}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-copper font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                      Open Workspace <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Accent */}
              <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-copper/30 rounded-tr-xl" />
            </div>
          )}

          {/* Section Divider */}
          <div className="flex items-center gap-4 opacity-0 animate-fade-in animate-delay-200">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">All Properties</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
          </div>

          {/* Projects Grid - Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(1).map((project, index) => (
              <div
                key={project.id}
                className={`opacity-0 animate-fade-in-up animate-delay-${Math.min((index + 3) * 100, 700)}`}
              >
                <ProjectCard project={project} onOpen={() => setActiveProject(project.id)} />
              </div>
            ))}

            {/* Create New - Premium Empty State */}
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className={`glass border-2 border-dashed border-border hover:border-copper/40 rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all group h-full min-h-[320px] opacity-0 animate-fade-in-up animate-delay-${Math.min((projects.length + 2) * 100, 700)}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6 group-hover:bg-copper/10 group-hover:border-copper/20 border border-transparent transition-all">
                <Plus className="w-7 h-7 group-hover:text-copper transition-colors" />
              </div>
              <span className="font-display text-xl mb-2">New Property</span>
              <span className="text-sm text-muted-foreground">Start a fresh workspace</span>
            </button>
          </div>

          {/* Bottom Flourish */}
          <div className="flex justify-center py-8 opacity-0 animate-fade-in animate-delay-500">
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wide">Powered by AI Vision</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal - Premium Glass Design */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 p-8 animate-scale-in">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-medium text-copper uppercase tracking-[0.2em] mb-2">Create</p>
                <h2 className="font-display text-2xl text-foreground">New Project</h2>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Victorian Renovation"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-copper/50 focus:outline-none focus:ring-2 focus:ring-copper/20 transition-all placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Property Address</label>
                <input
                  type="text"
                  value={newProjectAddress}
                  onChange={(e) => setNewProjectAddress(e.target.value)}
                  placeholder="e.g. 123 Maple Ave, Seattle, WA"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-copper/50 focus:outline-none focus:ring-2 focus:ring-copper/20 transition-all placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-copper" />
                  We'll automatically fetch property data and generate a 3D model.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName || !newProjectAddress}
                  className="px-5 py-2.5 rounded-xl bg-copper hover:bg-copper-dark text-background font-medium shadow-lg shadow-copper/25 hover:shadow-copper/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none btn-press"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      className="glass overflow-hidden hover:border-copper/30 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-copper/10 flex flex-col h-full rounded-2xl"
    >
      {/* Image with Premium Overlay */}
      <div className="h-44 overflow-hidden relative">
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

        {/* Status Badge - Premium Style */}
        <div className="absolute top-4 left-4">
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border ${
            project.status === 'in-progress'
              ? 'text-copper bg-copper/10 border-copper/20'
              : project.status === 'planning'
              ? 'text-muted-foreground bg-secondary/50 border-border'
              : 'text-green-400 bg-green-400/10 border-green-400/20'
          }`}>
            {project.status === 'in-progress' ? 'In Progress' : project.status === 'planning' ? 'Planning' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="font-display text-xl text-foreground group-hover:text-copper transition-colors mb-2">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-copper/60" />
            <span className="truncate">{project.config.location.address}</span>
          </p>
        </div>

        {/* Meta Grid - Refined */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-6">
          <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground block mb-1 text-[10px] uppercase tracking-wider">Style</span>
            <span className="text-foreground font-medium truncate block">{project.config.style}</span>
          </div>
          <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground block mb-1 text-[10px] uppercase tracking-wider">Budget</span>
            <span className="text-foreground font-medium">{project.config.budget}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(project.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-copper font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Open <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

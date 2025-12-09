import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Save, MapPin, Palette, DollarSign, Clock, LayoutTemplate, Briefcase, User, Activity } from 'lucide-react';

export const ProjectSettingsPage = () => {
  const { activeProjectId, projects, updateProjectConfig, updateProject, addNotification } = useStore();
  const project = projects.find(p => p.id === activeProjectId);

  const [details, setDetails] = useState({
    name: project?.name || '',
    clientName: project?.clientName || '',
    status: project?.status || 'planning'
  });

  const [config, setConfig] = useState(project?.config || {
    style: '',
    budget: 'Standard',
    timeline: '',
    preferences: '',
    location: { address: '', lat: 0, lng: 0 }
  });

  if (!project) return null;

  const handleSave = () => {
    // Update general details
    updateProject(activeProjectId, {
      name: details.name,
      clientName: details.clientName,
      status: details.status as any
    });

    // Update specific AI config
    updateProjectConfig(activeProjectId, config as any);
    
    addNotification('success', 'Workspace configuration saved successfully');
  };

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutTemplate className="w-8 h-8 text-blue-400" />
              Workspace Configuration
            </h2>
            <p className="text-sm text-slate-400 mt-2">Manage project identity, client details, and AI design constraints for <span className="text-white font-medium">{project.name}</span></p>
          </div>
           <button onClick={handleSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-900/20">
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Section */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Project Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Project Name</label>
                  <input 
                    type="text" 
                    value={details.name}
                    onChange={(e) => setDetails({...details, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none placeholder-slate-600"
                    placeholder="e.g. Downtown Loft Renovation"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Client Name
                    </label>
                    <input 
                      type="text" 
                      value={details.clientName}
                      onChange={(e) => setDetails({...details, clientName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-500" /> Status
                    </label>
                    <div className="relative">
                      <select 
                        value={details.status}
                        onChange={(e) => setDetails({...details, status: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                      >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Site Location
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Property Address</label>
                <input 
                  type="text" 
                  value={config.location.address}
                  onChange={(e) => setConfig({...config, location: {...config.location, address: e.target.value}})}
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Architectural Style
                </label>
                <select 
                  value={config.style}
                  onChange={(e) => setConfig({...config, style: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="Modern">Modern</option>
                  <option value="Industrial Chic">Industrial Chic</option>
                  <option value="Scandinavian">Scandinavian</option>
                  <option value="Mid-Century Modern">Mid-Century Modern</option>
                  <option value="Coastal">Coastal</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Minimalist">Minimalist</option>
                </select>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Budget Tier
                </label>
                <select 
                  value={config.budget}
                  // @ts-ignore
                  onChange={(e) => setConfig({...config, budget: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

             <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-orange-400" />
                 Timeline Goal
               </label>
               <input 
                 type="text" 
                 value={config.timeline}
                 onChange={(e) => setConfig({...config, timeline: e.target.value})}
                 placeholder="e.g. 3 months"
                 className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
               />
            </div>
          </div>

          {/* Sidebar Info - Design DNA */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 h-full flex flex-col">
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                   <LayoutTemplate className="w-4 h-4 text-blue-400" />
                   Design DNA & Constraints
                </label>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Provide nuanced instructions for the Generative AI model. These details are injected into every design prompt to ensure consistency with the client's vision.
                </p>
              </div>
              
              <textarea 
                value={config.preferences}
                onChange={(e) => setConfig({...config, preferences: e.target.value})}
                placeholder="E.g., Prefer natural materials, avoid dark colors, need wheelchair accessibility. The client loves warm lighting and open spaces..."
                className="flex-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none leading-relaxed text-sm"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Save, MapPin, Palette, DollarSign, Clock } from 'lucide-react';

export const ProjectSettings = ({ onClose }: { onClose: () => void }) => {
  const { activeProjectId, projects, updateProjectConfig, addNotification } = useStore();
  const project = projects.find(p => p.id === activeProjectId);

  const [config, setConfig] = useState(project?.config || {
    style: '',
    budget: 'Standard',
    timeline: '',
    preferences: '',
    location: { address: '', lat: 0, lng: 0 }
  });

  if (!project) return null;

  const handleSave = () => {
    updateProjectConfig(activeProjectId, config as any);
    addNotification('success', 'Project configuration updated');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Workspace Configuration</h2>
            <p className="text-sm text-slate-400">Define the AI parameters for {project.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Location Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Property Address
            </label>
            <input 
              type="text" 
              value={config.location.address}
              onChange={(e) => setConfig({...config, location: {...config.location, address: e.target.value}})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Architectural Style
              </label>
              <select 
                value={config.style}
                onChange={(e) => setConfig({...config, style: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none appearance-none"
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

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Budget Tier
              </label>
              <select 
                value={config.budget}
                onChange={(e) => setConfig({...config, budget: e.target.value as any})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="Economy">Economy</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Timeline Goal
              </label>
              <input 
                type="text" 
                value={config.timeline}
                onChange={(e) => setConfig({...config, timeline: e.target.value})}
                placeholder="e.g. 3 months"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Design Preferences & Constraints</label>
            <textarea 
              value={config.preferences}
              onChange={(e) => setConfig({...config, preferences: e.target.value})}
              rows={4}
              placeholder="E.g., Prefer natural materials, avoid dark colors, need wheelchair accessibility..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-slate-500">These details will be injected into every AI generation prompt.</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-medium transition-colors">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
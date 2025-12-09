import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Save, MapPin, Palette, DollarSign, Clock, Image as ImageIcon } from 'lucide-react';

const STYLE_REFERENCES: Record<string, { label: string, url: string }[]> = {
  'Modern': [
    { label: 'Minimalist Interior', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80' },
    { label: 'Clean Lines', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80' },
    { label: 'Neutral Tones', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=300&q=80' }
  ],
  'Industrial Chic': [
    { label: 'Exposed Brick', url: 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?auto=format&fit=crop&w=300&q=80' },
    { label: 'Metal Accents', url: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?auto=format&fit=crop&w=300&q=80' },
    { label: 'Raw Materials', url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=300&q=80' }
  ],
  'Scandinavian': [
    { label: 'Light Wood', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80' },
    { label: 'Cozy Textiles', url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=300&q=80' },
    { label: 'Bright Spaces', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=300&q=80' }
  ],
  'Coastal': [
    { label: 'Breezy Whites', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80' },
    { label: 'Ocean Blues', url: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=300&q=80' },
    { label: 'Natural Light', url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=300&q=80' }
  ],
  // Fallback for others
  'default': [
    { label: 'Inspiration 1', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80' },
    { label: 'Inspiration 2', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=300&q=80' },
    { label: 'Inspiration 3', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80' }
  ]
};

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
              
              {/* Style References Preview */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">Visual References</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {(STYLE_REFERENCES[config.style] ?? STYLE_REFERENCES['default'] ?? []).map((ref, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden group border border-slate-700">
                            <img src={ref.url} alt={ref.label} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                                <span className="text-[10px] text-white font-medium truncate">{ref.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
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
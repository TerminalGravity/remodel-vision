import { create } from 'zustand';
import { ChatMessage, AppStatus, GeneratedResult, Project, Notification, AppViewMode, PropertyMeta, WorkspaceView } from '../types';
import { geminiService } from '../services/geminiService';

interface AppState {
  // Navigation
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  workspaceView: WorkspaceView;
  setWorkspaceView: (view: WorkspaceView) => void;

  // Projects (Multi-tenant simulation)
  projects: Project[];
  activeProjectId: string;
  setActiveProject: (id: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  updateProjectConfig: (projectId: string, updates: Partial<Project['config']>) => void;
  
  // Real Property Data
  activePropertyMeta: PropertyMeta | null;
  fetchPropertyMeta: (address: string) => Promise<void>;
  updatePropertyMeta: (meta: PropertyMeta) => void;

  // Chat & AI State
  messages: ChatMessage[];
  status: AppStatus;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStatus: (status: AppStatus) => void;
  
  // 3D & Context State
  modelUrl: string | null;
  setModelUrl: (url: string) => void;
  siteMode: boolean; // Toggle between Interior vs Site context
  setSiteMode: (enabled: boolean) => void;
  
  selectedRoom: string | null;
  setSelectedRoom: (roomName: string | null) => void;
  
  // Capture State
  captureRequest: boolean;
  setCaptureRequest: (request: boolean) => void;
  
  // Results
  lastGeneratedResult: GeneratedResult | null;
  setGeneratedResult: (result: GeneratedResult | null) => void;

  // Project "Truth"
  projectContext: string;
  updateProjectContext: (info: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
}

const INITIAL_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: 'Downtown Loft Renovation', 
    clientName: 'Alice Chen', 
    status: 'in-progress', 
    lastModified: Date.now(),
    thumbnail: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=600&auto=format&fit=crop',
    config: {
      style: 'Industrial Chic',
      budget: 'Premium',
      timeline: '3 Months',
      preferences: 'Exposed brick, open concept, smart lighting',
      location: { lat: 40.7128, lng: -74.0060, address: '142 Bowery, New York, NY' }
    }
  },
  { 
    id: '2', 
    name: 'Seaside Villa Expansion', 
    clientName: 'Marcus Thorne', 
    status: 'planning', 
    lastModified: Date.now() - 86400000,
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    config: {
      style: 'Coastal Modern',
      budget: 'Luxury',
      timeline: '6 Months',
      preferences: 'Natural light, travertine floors, indoor-outdoor flow',
      location: { lat: 34.0259, lng: -118.7798, address: '22 Malibu Rd, Malibu, CA' }
    }
  },
  { 
    id: '3', 
    name: 'Suburban Kitchen Remodel', 
    clientName: 'The Johnsons', 
    status: 'completed', 
    lastModified: Date.now() - 172800000,
    thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=600&auto=format&fit=crop',
    config: {
      style: 'Transitional',
      budget: 'Standard',
      timeline: '6 Weeks',
      preferences: 'Large island, white oak cabinetry, durable surfaces',
      location: { lat: 41.8781, lng: -87.6298, address: '88 Elm St, Hinsdale, IL' }
    }
  },
];

export const useStore = create<AppState>((set, get) => ({
  viewMode: AppViewMode.DASHBOARD,
  setViewMode: (mode) => set({ viewMode: mode }),
  
  workspaceView: 'DESIGN',
  setWorkspaceView: (view) => set({ workspaceView: view }),

  projects: INITIAL_PROJECTS,
  activeProjectId: '1',
  setActiveProject: async (id) => {
    const project = get().projects.find(p => p.id === id);
    set({ 
      activeProjectId: id, 
      viewMode: AppViewMode.EDITOR,
      workspaceView: 'DESIGN',
      messages: [{
        id: 'init',
        role: 'system',
        content: `Active Workspace: **${project?.name}**\nConfig: ${project?.config.style} | ${project?.config.budget}\n\nAnalyzing property data...`,
        timestamp: Date.now()
      }],
      projectContext: "",
      modelUrl: null,
      lastGeneratedResult: null,
      activePropertyMeta: null // Reset while fetching
    });
    
    get().addNotification('info', `Opened workspace: ${project?.name}`);
    
    // Auto-fetch property details
    if (project?.config.location.address) {
      get().fetchPropertyMeta(project.config.location.address);
    }
  },

  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, lastModified: Date.now() }
        : p
    )
  })),

  updateProjectConfig: (projectId, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId 
        ? { ...p, config: { ...p.config, ...updates } }
        : p
    )
  })),

  activePropertyMeta: null,
  fetchPropertyMeta: async (address) => {
    try {
      const meta = await geminiService.getPropertyDetails(address);
      set({ activePropertyMeta: meta });
      get().addMessage({
        role: 'system',
        content: `**Property Intelligence Loaded**\nZoning: ${meta.zoning}\nYear Built: ${meta.yearBuilt}\nLot: ${meta.lotSize}`
      });
    } catch (e) {
      console.error(e);
    }
  },
  updatePropertyMeta: (meta) => set({ activePropertyMeta: meta }),

  messages: [],
  status: AppStatus.IDLE,
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),
  setStatus: (status) => set({ status }),
  
  modelUrl: null,
  setModelUrl: (url) => set({ modelUrl: url }),
  
  siteMode: false,
  setSiteMode: (enabled) => set({ siteMode: enabled }),
  
  selectedRoom: null,
  setSelectedRoom: (roomName) => set({ selectedRoom: roomName }),
  
  captureRequest: false,
  setCaptureRequest: (request) => set({ captureRequest: request }),
  
  lastGeneratedResult: null,
  setGeneratedResult: (result) => set({ lastGeneratedResult: result }),

  projectContext: "",
  updateProjectContext: (info) => set((state) => ({ projectContext: state.projectContext + "\n" + info })),

  notifications: [],
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ notifications: [...state.notifications, { id, type, message }] }));
    setTimeout(() => get().removeNotification(id), 5000);
  },
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  }))
}));
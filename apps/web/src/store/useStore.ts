import { create } from 'zustand';
import { ChatMessage, AppStatus, GeneratedResult, Project, Notification, AppViewMode, PropertyMeta, WorkspaceView, GenerationConfig, MediaType } from '../types';
import { geminiService } from '../services/geminiService';
import { fetchPropertyData, isPropertyServiceAvailable, legacyMetaToContext } from '../services/property';
import { generateRoomsFromDetails } from '../services/property/roomGenerator';
import type { PropertyContext, PropertyMeta as LegacyPropertyMeta } from '../types/property';

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
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  updateProjectConfig: (projectId: string, updates: Partial<Project['config']>) => void;
  
  // Real Property Data
  activePropertyMeta: PropertyMeta | null;
  activePropertyContext: PropertyContext | null;
  propertyFetchStatus: 'idle' | 'loading' | 'success' | 'error';
  propertyFetchErrors: Array<{ source: string; error: string }>;
  isProcessingFloorPlan: boolean;
  setProcessingFloorPlan: (processing: boolean) => void;
  updatePropertyRooms: (rooms: import('../types/property').RoomContext[]) => void;
  fetchPropertyMeta: (address: string) => Promise<void>;
  fetchPropertyContext: (address: string) => Promise<void>;
  updatePropertyMeta: (meta: PropertyMeta) => void;
  updatePropertyContext: (context: PropertyContext) => void;

  // Chat & AI State
  messages: ChatMessage[];
  status: AppStatus;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStatus: (status: AppStatus) => void;
  
  // Generation Settings
  generationConfig: GenerationConfig;
  updateGenerationConfig: (config: Partial<GenerationConfig>) => void;
  activeMediaType: MediaType;
  setActiveMediaType: (type: MediaType) => void;

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
  
  // Results & Gallery
  generatedResults: GeneratedResult[];
  activeResultId: string | null;
  setGeneratedResults: (results: GeneratedResult[]) => void;
  addGeneratedResult: (result: GeneratedResult) => void;
  removeGeneratedResult: (id: string) => void;
  setActiveResult: (id: string | null) => void;

  // Reference Images for Generation
  referenceImages: Record<string, string>;  // element name → base64
  addReferenceImage: (element: string, imageData: string) => void;
  removeReferenceImage: (element: string) => void;
  clearReferenceImages: () => void;

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
      generatedResults: [],
      activeResultId: null,
      activePropertyMeta: null, // Reset while fetching
      activePropertyContext: null,
      propertyFetchStatus: 'idle',
      propertyFetchErrors: [],
      referenceImages: {} // Reset reference images for new project
    });

    get().addNotification('info', `Opened workspace: ${project?.name}`);

    // Auto-fetch property details using new Firecrawl service if available
    if (project?.config.location.address) {
      if (isPropertyServiceAvailable()) {
        get().fetchPropertyContext(project.config.location.address);
      } else {
        // Fall back to Gemini-based estimation
        get().fetchPropertyMeta(project.config.location.address);
      }
    }
  },

  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects],
    activeProjectId: project.id
  })),

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
  activePropertyContext: null,
  propertyFetchStatus: 'idle',
  propertyFetchErrors: [],
  isProcessingFloorPlan: false,
  setProcessingFloorPlan: (processing) => set({ isProcessingFloorPlan: processing }),
  updatePropertyRooms: (rooms) => set((state) => {
    if (!state.activePropertyContext) return {};
    return {
      activePropertyContext: {
        ...state.activePropertyContext,
        rooms: rooms
      }
    };
  }),

  fetchPropertyMeta: async (address) => {
    try {
      set({ propertyFetchStatus: 'loading' });
      
      // Use Thinking mode for deeper analysis
      const meta = await geminiService.getPropertyDetails(address, get().generationConfig.thinkingMode);
      
      // Convert to full context for compatibility
      const partialContext = legacyMetaToContext(meta, address);
      
      // Generate a mock ID and metadata
      const now = new Date().toISOString();
      const context: PropertyContext = {
       id: `prop_ai_${Date.now()}`,
       version: 1,
       createdAt: now,
       updatedAt: now,
       ...partialContext as any, // Cast because helper returns partial
       // Ensure required fields that might be missing from partial are present
       sources: [{
         source: 'ai-estimate',
         confidence: 0.6,
         scrapedAt: now,
         fields: Object.keys(meta)
       }],
       metadata: {
         completeness: 50,
         dataQuality: 'estimated',
         confidence: { overall: 0.6 }
       },
       rooms: partialContext.details ? generateRoomsFromDetails(partialContext.details) : []
      };

      set({ 
        activePropertyMeta: meta,
        activePropertyContext: context,
        propertyFetchStatus: 'success'
      });
      
      get().addMessage({
        role: 'system',
        content: `**Property Intelligence Loaded** (AI Estimated)\nZoning: ${meta.zoning}\nYear Built: ${meta.yearBuilt}\nLot: ${meta.lotSize}\n\n*Note: Public records unavailable. Using AI estimation.*`
      });
    } catch (e) {
      console.error(e);
      set({ propertyFetchStatus: 'error', propertyFetchErrors: [{ source: 'system', error: String(e) }] });
    }
  },

  fetchPropertyContext: async (address) => {
    set({ propertyFetchStatus: 'loading', propertyFetchErrors: [] });
    get().addMessage({
      role: 'system',
      content: `🔍 **Fetching Property Data**\nSearching Zillow, Redfin, and county records for:\n${address}`
    });

    try {
      const result = await fetchPropertyData(address);

      if (result.success && result.property) {
        const prop = result.property;

        // Convert to legacy PropertyMeta for backwards compatibility
        const legacyMeta: PropertyMeta = {
          zoning: prop.regulatory?.zoning || 'Unknown',
          lotSize: prop.details?.lotSize
            ? `${prop.details.lotSize.value} ${prop.details.lotSize.unit}`
            : 'Unknown',
          yearBuilt: prop.details?.yearBuilt?.toString() || 'Unknown',
          sunExposure: prop.location?.orientation
            ? `${prop.location.orientation}-Facing`
            : 'Variable',
          schoolDistrict: prop.neighborhood?.schoolDistrict || 'Unknown',
          walkScore: prop.neighborhood?.walkScore || 50
        };

        set({
          activePropertyContext: prop,
          activePropertyMeta: legacyMeta,
          propertyFetchStatus: 'success',
          propertyFetchErrors: result.errors
        });

        // Build detailed status message
        const sources = prop.sources?.map(s => s.source).join(', ') || 'multiple sources';
        const completeness = prop.metadata?.completeness || 0;

        get().addMessage({
          role: 'system',
          content: `**Property Intelligence Loaded** ✅\n` +
            `📍 ${prop.address?.formatted || address}\n` +
            `🏠 ${prop.details?.bedrooms || 0} bed, ${prop.details?.bathrooms || 0} bath | ${prop.details?.livingArea?.value || 0} sqft\n` +
            `📅 Built ${prop.details?.yearBuilt || 'Unknown'}\n` +
            `🏛️ Zoning: ${prop.regulatory?.zoning || 'Unknown'}\n` +
            `💰 Est. Value: $${(prop.valuation?.marketEstimate || 0).toLocaleString()}\n` +
            `🚶 Walk Score: ${prop.neighborhood?.walkScore || 'N/A'}\n\n` +
            `_Data from ${sources} (${completeness}% complete)_`
        });

        if (result.errors.length > 0) {
          get().addNotification('info', `Some sources unavailable: ${result.errors.map(e => e.source).join(', ')}`);
        }
      } else {
        set({
          propertyFetchStatus: 'error',
          propertyFetchErrors: result.errors
        });

        // Fall back to Gemini estimation
        get().addMessage({
          role: 'system',
          content: `⚠️ **Web Scraping Unavailable**\nFalling back to AI estimation...`
        });
        get().fetchPropertyMeta(address);
      }
    } catch (error) {
      console.error('Property fetch error:', error);
      set({
        propertyFetchStatus: 'error',
        propertyFetchErrors: [{ source: 'system', error: String(error) }]
      });

      // Fall back to Gemini estimation
      get().fetchPropertyMeta(address);
    }
  },

  updatePropertyMeta: (meta) => set({ activePropertyMeta: meta }),
  updatePropertyContext: (context) => set({ activePropertyContext: context }),

  messages: [],
  status: AppStatus.IDLE,
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),
  setStatus: (status) => set({ status }),
  
  // Generation Settings
  generationConfig: {
    aspectRatio: '16:9',
    resolution: '4k',
    thinkingMode: false
  },
  updateGenerationConfig: (config) => set((state) => ({ generationConfig: { ...state.generationConfig, ...config } })),
  activeMediaType: 'image',
  setActiveMediaType: (type) => set({ activeMediaType: type }),

  modelUrl: null,
  setModelUrl: (url) => set({ modelUrl: url }),
  
  siteMode: false,
  setSiteMode: (enabled) => set({ siteMode: enabled }),
  
  selectedRoom: null,
  setSelectedRoom: (roomName) => set({ selectedRoom: roomName }),
  
  captureRequest: false,
  setCaptureRequest: (request) => set({ captureRequest: request }),
  
  generatedResults: [],
  activeResultId: null,
  setGeneratedResults: (results) => set({ generatedResults: results }),
  addGeneratedResult: (result) => set((state) => ({ 
    generatedResults: [result, ...state.generatedResults],
    activeResultId: result.id
  })),
  removeGeneratedResult: (id) => set((state) => ({
    generatedResults: state.generatedResults.filter(r => r.id !== id),
    activeResultId: state.activeResultId === id ? null : state.activeResultId
  })),
  setActiveResult: (id) => set({ activeResultId: id }),

  // Reference Images
  referenceImages: {},
  addReferenceImage: (element, imageData) => set((state) => ({
    referenceImages: { ...state.referenceImages, [element]: imageData }
  })),
  removeReferenceImage: (element) => set((state) => {
    const { [element]: _, ...rest } = state.referenceImages;
    return { referenceImages: rest };
  }),
  clearReferenceImages: () => set({ referenceImages: {} }),

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

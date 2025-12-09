import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  PropertyContextSummary, 
  ProjectConfigSummary, 
  DesignRevisionSummary, 
  AssetReferenceSummary,
  ProjectConfig,
  PropertyContext,
  DesignRevision,
  AssetReference
} from '@remodelvision/sdk';

// State Interfaces
interface PropertyContextState {
  currentPropertyId?: string;
  properties: Record<string, PropertyContextSummary>;
  activePropertyData?: PropertyContext; // Loaded full context
  
  setCurrentProperty: (id: string) => void;
  upsertProperty: (ctx: PropertyContext | PropertyContextSummary) => void;
  updateActivePropertyData: (data: Partial<PropertyContext>) => void;
}

interface ProjectConfigState {
  currentProjectId?: string;
  projects: Record<string, ProjectConfigSummary>;
  activeProjectConfig?: ProjectConfig; // Loaded full config
  
  setCurrentProject: (id: string) => void;
  upsertProject: (config: ProjectConfig | ProjectConfigSummary) => void;
  updateActiveProjectConfig: (config: Partial<ProjectConfig>) => void;
}

interface DesignHistoryState {
  revisionsByPropertyId: Record<string, DesignRevisionSummary[]>;
  activeRevision?: DesignRevision;
  
  addRevision: (propId: string, rev: DesignRevision) => void;
  setActiveRevision: (rev: DesignRevision | undefined) => void;
}

interface AssetLibraryState {
  assets: Record<string, AssetReferenceSummary>;
  addAsset: (asset: AssetReference) => void;
}

interface UIState {
  viewMode: 'dashboard' | 'workspace';
  workspaceView: 'design' | 'settings' | 'intelligence';
  selectedRoomId?: string;
  selectedAssetId?: string;
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
  setWorkspaceView: (view: 'design' | 'settings' | 'intelligence') => void;
  setSelectedRoom: (id?: string) => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

// Unified Store Type
type UnifiedStore = PropertyContextState & ProjectConfigState & DesignHistoryState & AssetLibraryState & UIState;

export const useUnifiedStore = create<UnifiedStore>()(
  persist(
    immer((set) => ({
      // Property Context
      currentPropertyId: undefined,
      properties: {},
      activePropertyData: undefined,
      setCurrentProperty: (id) => set((state) => { state.currentPropertyId = id; }),
      upsertProperty: (ctx) => set((state) => {
        // If it's a full context, we might want to store summary in 'properties' list and data in 'activePropertyData' if matches
        const summary: PropertyContextSummary = {
          id: ctx.id,
          address: 'address' in ctx ? ctx.address : (ctx as PropertyContextSummary).address,
          updatedAt: ctx.updatedAt
        };
        state.properties[ctx.id] = summary;
        
        if ('rooms' in ctx && state.currentPropertyId === ctx.id) {
           state.activePropertyData = ctx as PropertyContext;
        }
      }),
      updateActivePropertyData: (data) => set((state) => {
        if (state.activePropertyData) {
          Object.assign(state.activePropertyData, data);
          // Also update summary if address changed
          if (data.address) {
             state.properties[state.activePropertyData.id].address = data.address;
          }
        }
      }),

      // Project Config
      currentProjectId: undefined,
      projects: {},
      activeProjectConfig: undefined,
      setCurrentProject: (id) => set((state) => { state.currentProjectId = id; }),
      upsertProject: (config) => set((state) => {
        const summary: ProjectConfigSummary = {
          id: config.id,
          name: config.name,
          status: 'status' in config ? config.status : (config as ProjectConfigSummary).status,
          updatedAt: config.updatedAt
        };
        state.projects[config.id] = summary;
        
        if ('location' in config && state.currentProjectId === config.id) {
          state.activeProjectConfig = config as ProjectConfig;
        }
      }),
      updateActiveProjectConfig: (config) => set((state) => {
        if (state.activeProjectConfig) {
          Object.assign(state.activeProjectConfig, config);
          if (config.name) state.projects[state.activeProjectConfig.id].name = config.name;
        }
      }),

      // Design History
      revisionsByPropertyId: {},
      activeRevision: undefined,
      addRevision: (propId, rev) => set((state) => {
        if (!state.revisionsByPropertyId[propId]) {
          state.revisionsByPropertyId[propId] = [];
        }
        // Store summary
        state.revisionsByPropertyId[propId].push({
          id: rev.id,
          createdAt: rev.createdAt,
          prompt: rev.prompt,
          outputAssetId: rev.outputAssetId
        });
        state.activeRevision = rev;
      }),
      setActiveRevision: (rev) => set((state) => { state.activeRevision = rev; }),

      // Asset Library
      assets: {},
      addAsset: (asset) => set((state) => {
        state.assets[asset.id] = {
          id: asset.id,
          type: asset.type,
          url: asset.url,
          thumbnailUrl: asset.thumbnailUrl
        };
      }),

      // UI State
      viewMode: 'dashboard',
      workspaceView: 'design',
      selectedRoomId: undefined,
      selectedAssetId: undefined,
      notifications: [],
      setViewMode: (mode) => set((state) => { state.viewMode = mode; }),
      setWorkspaceView: (view) => set((state) => { state.workspaceView = view; }),
      setSelectedRoom: (id) => set((state) => { state.selectedRoomId = id; }),
      addNotification: (type, message) => set((state) => {
        state.notifications.push({ id: crypto.randomUUID(), type, message });
      }),
      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter((n: any) => n.id !== id);
      }),
    })),
    {
      name: 'remodel-vision-storage',
      partialize: (state) => ({
        // Selectively persist fields
        currentPropertyId: state.currentPropertyId,
        properties: state.properties,
        currentProjectId: state.currentProjectId,
        projects: state.projects,
        revisionsByPropertyId: state.revisionsByPropertyId,
        assets: state.assets
        // Don't persist UI state or large active data blobs (load them on demand typically, but for prototype we might want to? Task 21 says yes)
      }),
    }
  )
);


export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'file';
  url: string; // Base64 or Blob URL
  name: string;
}

export interface PropertyMeta {
  zoning: string;
  lotSize: string;
  yearBuilt: string;
  sunExposure: string;
  schoolDistrict: string;
  walkScore: number;
}

export interface ProjectConfig {
  style: string;
  budget: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
  timeline: string;
  preferences: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: 'planning' | 'in-progress' | 'completed';
  lastModified: number;
  thumbnail?: string;
  config: ProjectConfig;
  propertyMeta?: PropertyMeta; // Cached property data
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING_CONTEXT = 'ANALYZING_CONTEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  READY = 'READY',
  ERROR = 'ERROR'
}

export enum AppViewMode {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR'
}

export type WorkspaceView = 'DESIGN' | 'SETTINGS' | 'INTELLIGENCE' | 'GALLERY';

export type MediaType = 'image' | 'video' | 'audio';

export interface GenerationConfig {
  aspectRatio: '16:9' | '4:3' | '1:1';
  resolution: '2k' | '4k';
  thinkingMode: boolean; // Enables gemini-3-pro-preview
}

export interface GeneratedResult {
  id: string;
  originalImage?: string; // Base64 of the 3D scene (optional for video/audio)
  generatedUrl: string; // URL/Base64 from Gemini/Veo
  thumbnailUrl?: string; // For videos
  type: MediaType;
  prompt: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

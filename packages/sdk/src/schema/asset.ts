import { BaseEntity, DataSource } from './types';

export interface AssetReference extends BaseEntity {
  type: 'image' | 'video' | 'model3d' | 'doc';
  url: string;
  thumbnailUrl?: string;
  source: DataSource;
  mimeType?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

export interface DesignRevision extends BaseEntity {
  propertyId: string;
  projectId?: string;
  roomId?: string;
  createdBy: 'user' | 'ai';
  prompt: string;
  model: string;
  inputContextSnapshotId?: string;
  outputAssetId?: string;
  metadata?: Record<string, unknown>;
}

export type AssetReferenceSummary = Pick<AssetReference, 'id' | 'type' | 'url' | 'thumbnailUrl'>;
export type DesignRevisionSummary = Pick<DesignRevision, 'id' | 'createdAt' | 'prompt' | 'outputAssetId'>;


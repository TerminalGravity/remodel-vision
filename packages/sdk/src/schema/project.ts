import { BaseEntity } from './types';

export type ProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'completed';

export interface ProjectConfig extends BaseEntity {
  propertyId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  targetEndDate?: string;
  budgetEstimate?: number;
  style?: string; // e.g., "Modern Farmhouse"
  location: {
    address: string;
  };
}

export interface ProjectConfigSummary extends Pick<ProjectConfig, 'id' | 'name' | 'status' | 'updatedAt'> {}


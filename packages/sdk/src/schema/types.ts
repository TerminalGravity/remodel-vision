// Base Types
export type Unit = 'in' | 'ft' | 'cm' | 'm';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ConfidenceLevel = number; // 0.0 to 1.0

export type DataSource = 'user' | 'doc' | 'web' | 'ai';


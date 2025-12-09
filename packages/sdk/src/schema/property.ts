import { BaseEntity, Unit, DataSource, ConfidenceLevel } from './types';

export interface MeasurementValue {
  value: number;
  unit: Unit;
  source: DataSource;
  confidence: ConfidenceLevel;
}

export interface MeasurementSet extends BaseEntity {
  propertyId: string;
  scope: 'room' | 'floor' | 'exterior' | 'global';
  label: string;
  values: Record<string, MeasurementValue>;
}

export interface RoomContext extends BaseEntity {
  propertyId: string;
  name: string;
  floorIndex: number;
  measurementSetId?: string;
  tags: string[];
  designIntent?: string;
}

export interface PropertyContext extends BaseEntity {
  address: string;
  geo?: {
    lat: number;
    lng: number;
  };
  externalIds?: {
    zillowId?: string;
    redfinId?: string;
  };
  rooms: RoomContext[];
  measurementSets: MeasurementSet[];
  notes: string[];
}

export type PropertyContextSummary = Pick<PropertyContext, 'id' | 'address' | 'updatedAt'>;


/**
 * Source Document Types - PRD-008 Complete Specification
 *
 * Complete schema for tracking uploaded documents and their extracted data.
 * Enables document processing pipeline with extraction annotations and review workflow.
 */

import type { PropertyContext } from './property';

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════

export type DocumentType =
  | 'floor-plan'
  | 'blueprint'
  | 'room-photo'
  | 'exterior-photo'
  | 'listing-pdf'
  | 'inspection-report'
  | 'permit'
  | 'appraisal'
  | 'survey'
  | 'deed'
  | 'hoa-docs'
  | 'material-spec'
  | 'invoice'
  | 'contract'
  | 'warranty'
  | 'manual'
  | 'receipt'
  | 'unknown';

export type DocumentSource = 'upload' | 'url' | 'email' | 'api' | 'scan' | 'screenshot';

// ═══════════════════════════════════════════════════════════════
// FILE INFO
// ═══════════════════════════════════════════════════════════════

/**
 * File information for uploaded documents
 */
export interface FileInfo {
  name: string;           // Original filename
  type: string;           // MIME type (e.g., "application/pdf")
  size: number;           // Size in bytes
  extension: string;      // File extension (e.g., "pdf")
  hash: string;           // SHA-256 hash for deduplication

  // Dimensions (for images)
  width?: number;
  height?: number;

  // PDF specifics
  pageCount?: number;

  // Storage
  storagePath?: string;
  storageUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * AI classification result for a document
 */
export interface DocumentClassification {
  type: DocumentType;
  confidence: number;     // 0-1
  detectedAt: string;     // ISO 8601
  model?: string;         // Model used for classification

  // Secondary classifications
  alternativeTypes?: Array<{
    type: DocumentType;
    confidence: number;
  }>;

  // Content hints
  containsFloorPlan?: boolean;
  containsMeasurements?: boolean;
  containsPhotos?: boolean;
  language?: string;
}

// ═══════════════════════════════════════════════════════════════
// PROCESSING STATUS
// ═══════════════════════════════════════════════════════════════

export type ProcessingStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Processing state for a document
 */
export interface ProcessingState {
  status: ProcessingStatus;

  // Timing
  queuedAt?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;       // Processing time in ms

  // Progress (for multi-step processing)
  currentStep?: string;
  stepsCompleted?: number;
  totalSteps?: number;
  progressPercent?: number;

  // Error handling
  error?: string;
  errorCode?: string;
  errorDetails?: Record<string, unknown>;
  retryCount: number;
  maxRetries?: number;
  nextRetryAt?: string;

  // Resource usage
  tokensUsed?: number;
  costEstimate?: number;
}

// ═══════════════════════════════════════════════════════════════
// BOUNDING BOX (for annotations)
// ═══════════════════════════════════════════════════════════════

/**
 * Bounding box for locating extracted data in documents
 */
export interface BoundingBox {
  // Position (normalized 0-1 or pixel coordinates)
  x: number;
  y: number;
  width: number;
  height: number;

  // Coordinate system
  unit: 'normalized' | 'pixels';

  // For multi-page documents
  page?: number;

  // Rotation/orientation
  rotation?: number;
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION ANNOTATION
// ═══════════════════════════════════════════════════════════════

export type ExtractionSource = 'ocr' | 'vision' | 'inference' | 'manual' | 'api';

/**
 * An annotation marking extracted data from a document
 */
export interface ExtractionAnnotation {
  id: string;

  // What was extracted
  field: string;           // PropertyContext field path (e.g., "details.bedrooms")
  value: unknown;          // Extracted value
  displayValue?: string;   // Human-readable version

  // Location in document
  boundingBox?: BoundingBox;
  pageNumber?: number;
  snippet?: string;        // Text context around extraction

  // Confidence and source
  confidence: number;      // 0-1
  source: ExtractionSource;
  model?: string;          // Model used for extraction

  // Verification
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  correctedValue?: unknown; // If user corrected

  // Reasoning
  reasoning?: string;      // Why this value was extracted
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION DATA
// ═══════════════════════════════════════════════════════════════

/**
 * Complete extraction results from a document
 */
export interface ExtractionData {
  // Raw content
  rawText?: string;        // OCR or extracted text
  rawHtml?: string;        // If source was HTML

  // Structured data (partial PropertyContext)
  structuredData: Partial<PropertyContext>;

  // Per-field confidence scores
  confidence: Record<string, number>;

  // Detailed annotations
  annotations: ExtractionAnnotation[];

  // Review workflow
  needsReview: boolean;
  reviewPriority?: 'high' | 'medium' | 'low';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;

  // Conflicts (when merging with existing data)
  conflicts?: Array<{
    field: string;
    existingValue: unknown;
    extractedValue: unknown;
    resolution?: 'keep-existing' | 'use-extracted' | 'manual';
  }>;
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT METADATA
// ═══════════════════════════════════════════════════════════════

/**
 * Metadata about a document upload
 */
export interface DocumentMetadata {
  uploadedAt: string;      // ISO 8601
  uploadedBy: string;      // User ID

  // Source
  source: DocumentSource;
  originalUrl?: string;    // If fetched from URL
  emailSubject?: string;   // If from email
  emailFrom?: string;

  // Organization
  folder?: string;
  tags?: string[];
  notes?: string;

  // Permissions
  isPublic?: boolean;
  sharedWith?: string[];

  // Retention
  expiresAt?: string;
  retentionPolicy?: string;
}

// ═══════════════════════════════════════════════════════════════
// SOURCE DOCUMENT (Complete Schema)
// ═══════════════════════════════════════════════════════════════

/**
 * Complete source document schema per PRD-008.
 * Tracks uploaded documents and their extracted data.
 */
export interface SourceDocument {
  id: string;
  propertyId: string;
  projectId?: string;

  // ═══════════════════════════════════════════════════════════════
  // FILE INFO
  // ═══════════════════════════════════════════════════════════════
  file: FileInfo;

  // ═══════════════════════════════════════════════════════════════
  // CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════
  classification: DocumentClassification;

  // ═══════════════════════════════════════════════════════════════
  // PROCESSING
  // ═══════════════════════════════════════════════════════════════
  processing: ProcessingState;

  // ═══════════════════════════════════════════════════════════════
  // EXTRACTION
  // ═══════════════════════════════════════════════════════════════
  extraction: ExtractionData;

  // ═══════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════
  metadata: DocumentMetadata;

  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════
  relatedDocuments?: string[];  // IDs of related documents
  supersedes?: string;          // ID of document this replaces
  supersededBy?: string;        // ID of document that replaced this

  // ═══════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// SOURCE DOCUMENT SUMMARY (for lists)
// ═══════════════════════════════════════════════════════════════

export type SourceDocumentSummary = Pick<
  SourceDocument,
  'id' | 'propertyId' | 'createdAt'
> & {
  fileName: string;
  fileType: string;
  documentType: DocumentType;
  processingStatus: ProcessingStatus;
  needsReview: boolean;
  thumbnailUrl?: string;
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new SourceDocument with defaults
 */
export function createSourceDocument(
  propertyId: string,
  file: FileInfo,
  uploadedBy: string,
  source: DocumentSource = 'upload'
): SourceDocument {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    propertyId,
    file,
    classification: {
      type: 'unknown',
      confidence: 0,
      detectedAt: now,
    },
    processing: {
      status: 'pending',
      retryCount: 0,
    },
    extraction: {
      structuredData: {},
      confidence: {},
      annotations: [],
      needsReview: false,
    },
    metadata: {
      uploadedAt: now,
      uploadedBy,
      source,
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculate file hash for deduplication (browser-compatible)
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create FileInfo from a File object
 */
export async function createFileInfo(file: File): Promise<FileInfo> {
  const hash = await calculateFileHash(file);
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    extension,
    hash,
  };
}

/**
 * Get documents that need review
 */
export function getDocumentsNeedingReview(docs: SourceDocument[]): SourceDocument[] {
  return docs.filter(d =>
    d.processing.status === 'completed' && d.extraction.needsReview
  );
}

/**
 * Get documents with extraction errors
 */
export function getFailedDocuments(docs: SourceDocument[]): SourceDocument[] {
  return docs.filter(d => d.processing.status === 'failed');
}

/**
 * Check if document is a duplicate (by hash)
 */
export function isDuplicate(doc: SourceDocument, existingDocs: SourceDocument[]): boolean {
  return existingDocs.some(
    existing => existing.id !== doc.id && existing.file.hash === doc.file.hash
  );
}

/**
 * Get overall extraction confidence for a document
 */
export function getOverallConfidence(doc: SourceDocument): number {
  const confidenceValues = Object.values(doc.extraction.confidence);
  if (confidenceValues.length === 0) return 0;

  return confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length;
}

/**
 * Merge extracted data into PropertyContext
 */
export function mergeExtraction(
  property: PropertyContext,
  extraction: ExtractionData
): PropertyContext {
  // Deep merge structuredData into property
  // This is a simplified version - real implementation would handle conflicts
  return {
    ...property,
    ...extraction.structuredData,
    // Preserve arrays by concatenating
    rooms: [
      ...property.rooms,
      ...(extraction.structuredData.rooms || []),
    ],
    sources: [
      ...property.sources,
      ...(extraction.structuredData.sources || []),
    ],
    // Update metadata
    metadata: {
      ...property.metadata,
      completeness: Math.max(
        property.metadata.completeness,
        calculateCompleteness(extraction.structuredData)
      ),
    },
  };
}

/**
 * Calculate data completeness percentage
 */
function calculateCompleteness(data: Partial<PropertyContext>): number {
  const requiredFields = [
    'address',
    'details',
    'rooms',
  ];

  const presentFields = requiredFields.filter(field =>
    data[field as keyof PropertyContext] !== undefined
  );

  return Math.round((presentFields.length / requiredFields.length) * 100);
}

/**
 * Enhanced Persistence Layer - PRD-008 Specification
 *
 * IndexedDB-based storage with schema versioning and migration support.
 * Handles large datasets efficiently and enables future sync capabilities.
 */

import { get, set, del, createStore, type UseStore } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// SCHEMA VERSION & MIGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Current schema version. Increment when making breaking changes.
 * Version history:
 * - 1: Initial schema (basic localStorage persistence)
 * - 2: PRD-008 compliant schemas (MeasurementSet, DesignVersion, SourceDocument, ProjectConfig)
 */
export const SCHEMA_VERSION = 2;

/**
 * Persisted state shape (what gets stored)
 */
export interface PersistedState {
  version: number;
  timestamp: string;

  // Core data slices
  properties: Record<string, unknown>;
  projects: Record<string, unknown>;
  revisionsByPropertyId: Record<string, unknown[]>;
  assets: Record<string, unknown>;

  // Active selections (IDs only)
  currentPropertyId?: string;
  currentProjectId?: string;

  // User preferences
  userPreferences?: {
    theme: 'light' | 'dark' | 'system';
    defaultBudgetTier: string;
    defaultStyle: string;
    recentProjects: string[];
  };

  // Sync metadata
  syncState?: {
    lastSyncedAt?: string;
    pendingChanges: number;
    syncEnabled: boolean;
  };
}

/**
 * Migration function type
 */
type MigrationFn = (state: unknown) => unknown;

/**
 * Migration registry - maps from version N to version N+1
 */
const migrations: Record<number, MigrationFn> = {
  // Migration from v1 (legacy) to v2 (PRD-008 compliant)
  1: (state: unknown): unknown => {
    const oldState = state as Record<string, unknown>;

    // Ensure proper structure for new schema
    return {
      ...oldState,
      version: 2,
      timestamp: new Date().toISOString(),

      // Initialize sync state
      syncState: {
        lastSyncedAt: undefined,
        pendingChanges: 0,
        syncEnabled: false,
      },

      // Initialize user preferences if missing
      userPreferences: oldState.userPreferences || {
        theme: 'dark',
        defaultBudgetTier: 'standard',
        defaultStyle: 'transitional',
        recentProjects: [],
      },

      // Ensure arrays exist
      revisionsByPropertyId: oldState.revisionsByPropertyId || {},
      assets: oldState.assets || {},
      properties: oldState.properties || {},
      projects: oldState.projects || {},
    };
  },
};

/**
 * Apply migrations sequentially from current version to target version
 */
export function migrateState(
  state: unknown,
  fromVersion: number,
  toVersion: number = SCHEMA_VERSION
): unknown {
  let currentState = state;
  let currentVersion = fromVersion;

  while (currentVersion < toVersion) {
    const migration = migrations[currentVersion];
    if (migration) {
      console.log(`[Persistence] Migrating from v${currentVersion} to v${currentVersion + 1}`);
      currentState = migration(currentState);
    } else {
      console.warn(`[Persistence] No migration found for v${currentVersion}`);
    }
    currentVersion++;
  }

  return currentState;
}

// ═══════════════════════════════════════════════════════════════
// INDEXEDDB STORAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Create a dedicated IndexedDB store for the app
 */
const idbStore: UseStore = createStore('remodelvision-db', 'state-store');

/**
 * Custom storage adapter for Zustand persist middleware
 * Uses IndexedDB instead of localStorage for better performance with large data
 */
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await get<string>(name, idbStore);
      if (value === undefined) return null;

      // Check for migration needs
      try {
        const parsed = JSON.parse(value);
        const stateVersion = parsed.state?.version || 1;

        if (stateVersion < SCHEMA_VERSION) {
          console.log(`[Persistence] State version ${stateVersion} detected, migrating to v${SCHEMA_VERSION}`);
          const migratedState = migrateState(parsed.state, stateVersion);
          const newValue = JSON.stringify({ ...parsed, state: migratedState });

          // Save migrated state
          await set(name, newValue, idbStore);
          return newValue;
        }
      } catch {
        // If parsing fails, return as-is and let Zustand handle it
      }

      return value;
    } catch (error) {
      console.error('[Persistence] Error reading from IndexedDB:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Inject version and timestamp
      const parsed = JSON.parse(value);
      parsed.state = {
        ...parsed.state,
        version: SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
      };

      await set(name, JSON.stringify(parsed), idbStore);
    } catch (error) {
      console.error('[Persistence] Error writing to IndexedDB:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name, idbStore);
    } catch (error) {
      console.error('[Persistence] Error removing from IndexedDB:', error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════
// PARTIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Fields that should NOT be persisted (transient UI state)
 */
const TRANSIENT_FIELDS = new Set([
  // UI state
  'viewMode',
  'workspaceView',
  'selectedRoomId',
  'selectedAssetId',
  'notifications',

  // Functions (Zustand actions)
  'setViewMode',
  'setWorkspaceView',
  'setSelectedRoom',
  'addNotification',
  'removeNotification',
  'setCurrentProperty',
  'upsertProperty',
  'updateActivePropertyData',
  'setCurrentProject',
  'upsertProject',
  'updateActiveProjectConfig',
  'addRevision',
  'setActiveRevision',
  'addAsset',

  // Active (loaded) data blobs - load on demand
  'activePropertyData',
  'activeProjectConfig',
  'activeRevision',
]);

/**
 * Create a partialized state for persistence
 */
export function partializeState<T extends Record<string, unknown>>(state: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(state)) {
    if (!TRANSIENT_FIELDS.has(key) && typeof state[key] !== 'function') {
      result[key as keyof T] = state[key] as T[keyof T];
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// SYNC TRIGGERS (Stubs for future cloud sync)
// ═══════════════════════════════════════════════════════════════

export type SyncTrigger = 'manual' | 'timer' | 'online' | 'save';

export interface SyncConfig {
  enabled: boolean;
  triggers: SyncTrigger[];
  intervalMs?: number; // For timer trigger
  onSync?: (state: unknown) => Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Default sync configuration (disabled by default)
 */
export const defaultSyncConfig: SyncConfig = {
  enabled: false,
  triggers: ['save', 'online'],
  intervalMs: 30000, // 30 seconds
};

/**
 * Sync manager stub - to be implemented with Supabase realtime
 */
export class SyncManager {
  private config: SyncConfig;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(config: SyncConfig = defaultSyncConfig) {
    this.config = config;
    this.setupTriggers();
  }

  private setupTriggers(): void {
    if (!this.config.enabled) return;

    // Timer trigger
    if (this.config.triggers.includes('timer') && this.config.intervalMs) {
      this.intervalId = setInterval(() => {
        this.triggerSync('timer');
      }, this.config.intervalMs);
    }

    // Online trigger
    if (this.config.triggers.includes('online')) {
      window.addEventListener('online', () => {
        this.triggerSync('online');
      });
    }
  }

  async triggerSync(trigger: SyncTrigger): Promise<void> {
    if (!this.config.enabled) return;

    console.log(`[SyncManager] Sync triggered by: ${trigger}`);

    // Stub - actual implementation would:
    // 1. Get current state from store
    // 2. Diff with last synced state
    // 3. Push changes to Supabase
    // 4. Pull remote changes
    // 5. Merge and update local state
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE CONFIG
// ═══════════════════════════════════════════════════════════════

/**
 * Complete persistence configuration for Zustand
 */
export interface PersistenceConfig {
  name: string;
  version: number;
  storage: StateStorage;
  partialize: <T extends Record<string, unknown>>(state: T) => Partial<T>;
  migrate: (persistedState: unknown, version: number) => unknown;
}

/**
 * Create persistence config for Zustand store
 */
export function createPersistenceConfig(storeName: string): PersistenceConfig {
  return {
    name: storeName,
    version: SCHEMA_VERSION,
    storage: indexedDBStorage,
    partialize: partializeState,
    migrate: (persistedState: unknown, version: number) => {
      if (version < SCHEMA_VERSION) {
        return migrateState(persistedState, version);
      }
      return persistedState;
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Clear all persisted state (for testing/reset)
 */
export async function clearPersistedState(storeName: string): Promise<void> {
  await del(storeName, idbStore);
  console.log(`[Persistence] Cleared state for: ${storeName}`);
}

/**
 * Export current state as JSON (for backup/debugging)
 */
export async function exportState(storeName: string): Promise<string | null> {
  const state = await get<string>(storeName, idbStore);
  return state || null;
}

/**
 * Import state from JSON (for restore/debugging)
 */
export async function importState(storeName: string, stateJson: string): Promise<void> {
  await set(storeName, stateJson, idbStore);
  console.log(`[Persistence] Imported state for: ${storeName}`);
}

/**
 * Get storage usage estimate
 */
export async function getStorageUsage(): Promise<{ used: number; quota: number } | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}

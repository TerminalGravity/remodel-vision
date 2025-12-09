// Add missing interface
export interface RoleAssignment {
  email: string;
  role: WorkspaceRole;
}

/**
 * RemodelVision Platform Schema
 * Multi-tenant, multi-player architecture with AI Agent support
 */

// =============================================================================
// IDENTITY & AUTHENTICATION
// =============================================================================

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'agent';

export type UserType = 'human' | 'ai-agent' | 'service-account';

export interface User {
  id: string;
  type: UserType;
  email?: string; // Optional for AI agents
  name: string;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt?: string;
  metadata?: Record<string, unknown>;
}

export interface HumanUser extends User {
  type: 'human';
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  defaultWorkspaceId?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

// =============================================================================
// ORGANIZATIONS (Multi-Tenant)
// =============================================================================

export type OrganizationTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string; // URL-safe identifier
  logoUrl?: string;
  tier: OrganizationTier;
  ownerId: string;
  createdAt: string;
  settings: OrganizationSettings;
  billing?: BillingInfo;
  limits: UsageLimits;
  usage: UsageMetrics;
}

export interface OrganizationSettings {
  defaultProjectConfig: Partial<ProjectConfigDefaults>;
  allowedDomains?: string[]; // For SSO/email domain restrictions
  requireMfa: boolean;
  aiAgentsEnabled: boolean;
  maxAiAgents: number;
  dataRetentionDays: number;
}

export interface ProjectConfigDefaults {
  style: string;
  budget: string;
  defaultRoles: RoleAssignment[];
}

export interface BillingInfo {
  customerId?: string; // Stripe customer ID
  subscriptionId?: string;
  currentPeriodEnd?: string;
  paymentMethod?: 'card' | 'invoice';
}

export interface UsageLimits {
  maxProjects: number;
  maxPropertiesPerProject: number;
  maxMembersPerWorkspace: number;
  maxAiGenerationsPerMonth: number;
  maxStorageGb: number;
  maxApiCallsPerDay: number;
}

export interface UsageMetrics {
  projectCount: number;
  propertyCount: number;
  memberCount: number;
  aiGenerationsThisMonth: number;
  storageUsedGb: number;
  apiCallsToday: number;
  lastCalculatedAt: string;
}

// =============================================================================
// ORGANIZATION MEMBERSHIP
// =============================================================================

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt: string;
  permissions: OrganizationPermissions;
}

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'billing';

export interface OrganizationPermissions {
  canManageMembers: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
  canCreateProjects: boolean;
  canManageAiAgents: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

// =============================================================================
// WORKSPACES (Project Collaboration Spaces)
// =============================================================================

export type WorkspaceVisibility = 'private' | 'organization' | 'public';

export interface Workspace {
  id: string;
  organizationId: string;
  projectId: string; // Links to existing Project entity
  name: string;
  description?: string;
  visibility: WorkspaceVisibility;
  createdBy: string;
  createdAt: string;
  archivedAt?: string;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  allowGuestAccess: boolean;
  requireApprovalForJoin: boolean;
  aiAgentAutoAssign: boolean;
  defaultMemberRole: WorkspaceRole;
  notifyOnActivity: boolean;
}

// =============================================================================
// WORKSPACE MEMBERSHIP & PERMISSIONS
// =============================================================================

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  addedBy: string;
  addedAt: string;
  permissions: WorkspacePermissions;
  presence?: MemberPresence;
}

export interface WorkspacePermissions {
  // Property data
  canViewProperties: boolean;
  canEditProperties: boolean;
  canDeleteProperties: boolean;
  canVerifyData: boolean;

  // Design operations
  canGenerateDesigns: boolean;
  canApproveDesigns: boolean;
  canDeleteDesigns: boolean;

  // Collaboration
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canManageRoles: boolean;

  // AI Agents
  canDelegateToAgents: boolean;
  canConfigureAgents: boolean;

  // Admin
  canManageSettings: boolean;
  canArchiveWorkspace: boolean;
  canExportData: boolean;
}

export interface MemberPresence {
  status: 'online' | 'away' | 'offline';
  lastSeenAt: string;
  currentView?: string; // e.g., "property:123", "design:456"
  cursorPosition?: { x: number; y: number; viewId: string };
}

// =============================================================================
// AI AGENTS (Autonomous Workers)
// =============================================================================

export type AgentCapability =
  | 'property-research'      // Fetch property data from web sources
  | 'design-generation'      // Generate design renders
  | 'document-analysis'      // Analyze uploaded documents
  | 'measurement-extraction' // Extract measurements from floorplans
  | 'cost-estimation'        // Estimate project costs
  | 'communication'          // Respond to messages, send updates
  | 'scheduling'             // Manage timelines and milestones
  | 'quality-review'         // Review and validate data/designs
  | 'report-generation';     // Generate project reports

export type AgentStatus = 'active' | 'paused' | 'disabled' | 'error';

export interface AgentProfile {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  avatarUrl?: string;
  type: 'ai-agent';
  status: AgentStatus;

  // Capabilities & Configuration
  capabilities: AgentCapability[];
  modelConfig: AgentModelConfig;
  behavior: AgentBehavior;

  // Constraints
  constraints: AgentConstraints;

  // Stats
  createdAt: string;
  createdBy: string;
  lastActiveAt?: string;
  stats: AgentStats;
}

export interface AgentModelConfig {
  primaryModel: string; // e.g., 'gemini-2.5-flash'
  imageModel?: string;  // e.g., 'gemini-3-pro-image-preview'
  temperature: number;
  maxTokensPerRequest: number;
  systemPrompt?: string;
}

export interface AgentBehavior {
  // Autonomy level
  autonomyLevel: 'full' | 'supervised' | 'approval-required';

  // When to act
  triggerOn: AgentTrigger[];

  // How to communicate
  communicationStyle: 'formal' | 'friendly' | 'minimal';
  notifyHumansOn: AgentNotificationEvent[];

  // Work hours (optional)
  activeHours?: {
    timezone: string;
    schedule: { day: number; startHour: number; endHour: number }[];
  };
}

export type AgentTrigger =
  | 'new-property-added'
  | 'design-requested'
  | 'document-uploaded'
  | 'message-received'
  | 'scheduled-task'
  | 'data-quality-alert'
  | 'manual-delegation';

export type AgentNotificationEvent =
  | 'task-completed'
  | 'task-failed'
  | 'approval-needed'
  | 'anomaly-detected'
  | 'cost-threshold-reached';

export interface AgentConstraints {
  maxConcurrentTasks: number;
  maxDailyTasks: number;
  maxDailySpend: number; // API cost limit in dollars
  allowedWorkspaces: string[] | 'all';
  blockedActions?: string[];
  requireApprovalFor?: AgentCapability[];
}

export interface AgentStats {
  totalTasksCompleted: number;
  totalTasksFailed: number;
  averageTaskDuration: number; // ms
  totalApiCost: number;
  lastTaskAt?: string;
  successRate: number; // 0-1
}

// =============================================================================
// AGENT TASKS (Work Items)
// =============================================================================

export type TaskStatus =
  | 'pending'
  | 'queued'
  | 'in-progress'
  | 'awaiting-approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface AgentTask {
  id: string;
  workspaceId: string;
  agentId: string;

  // Task definition
  type: AgentCapability;
  title: string;
  description?: string;
  priority: TaskPriority;

  // Context
  targetEntityType: 'property' | 'project' | 'design' | 'document' | 'room';
  targetEntityId: string;
  inputData?: Record<string, unknown>;

  // Delegation
  delegatedBy: string; // User or agent ID
  delegatedAt: string;

  // Execution
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;

  // Results
  output?: TaskOutput;
  error?: TaskError;

  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Cost tracking
  apiCalls: number;
  tokensUsed: number;
  estimatedCost: number;
}

export interface TaskOutput {
  summary: string;
  data?: Record<string, unknown>;
  artifacts?: TaskArtifact[];
  recommendations?: string[];
}

export interface TaskArtifact {
  type: 'property-data' | 'design-image' | 'report' | 'measurement-set';
  entityId: string;
  url?: string;
}

export interface TaskError {
  code: string;
  message: string;
  retryable: boolean;
  retryCount: number;
  lastRetryAt?: string;
}

// =============================================================================
// ACTIVITY & AUDIT LOG
// =============================================================================

export type ActivityType =
  // User actions
  | 'user.joined'
  | 'user.left'
  | 'user.role-changed'

  // Property actions
  | 'property.created'
  | 'property.updated'
  | 'property.deleted'
  | 'property.verified'

  // Design actions
  | 'design.generated'
  | 'design.approved'
  | 'design.rejected'
  | 'design.deleted'

  // Agent actions
  | 'agent.task-delegated'
  | 'agent.task-completed'
  | 'agent.task-failed'
  | 'agent.approval-requested'

  // Workspace actions
  | 'workspace.created'
  | 'workspace.settings-changed'
  | 'workspace.archived';

export interface ActivityEntry {
  id: string;
  workspaceId: string;
  type: ActivityType;
  actorId: string; // User or agent
  actorType: UserType;
  targetType?: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// INVITATIONS
// =============================================================================

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  email: string;
  role: WorkspaceRole | OrganizationRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
  acceptedAt?: string;
  acceptedBy?: string;
}

// =============================================================================
// PLATFORM ADMIN
// =============================================================================

export interface PlatformAdmin {
  id: string;
  userId: string;
  level: 'super' | 'support' | 'readonly';
  permissions: PlatformAdminPermissions;
  createdAt: string;
  createdBy: string;
}

export interface PlatformAdminPermissions {
  canManageOrganizations: boolean;
  canManageUsers: boolean;
  canManageAgents: boolean;
  canViewBilling: boolean;
  canModifyBilling: boolean;
  canAccessAuditLogs: boolean;
  canImpersonateUsers: boolean;
  canModifyPlatformSettings: boolean;
}

// =============================================================================
// ROLE PERMISSION PRESETS
// =============================================================================

export const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermissions> = {
  owner: {
    canViewProperties: true,
    canEditProperties: true,
    canDeleteProperties: true,
    canVerifyData: true,
    canGenerateDesigns: true,
    canApproveDesigns: true,
    canDeleteDesigns: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canManageRoles: true,
    canDelegateToAgents: true,
    canConfigureAgents: true,
    canManageSettings: true,
    canArchiveWorkspace: true,
    canExportData: true,
  },
  admin: {
    canViewProperties: true,
    canEditProperties: true,
    canDeleteProperties: true,
    canVerifyData: true,
    canGenerateDesigns: true,
    canApproveDesigns: true,
    canDeleteDesigns: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canManageRoles: true,
    canDelegateToAgents: true,
    canConfigureAgents: true,
    canManageSettings: true,
    canArchiveWorkspace: false,
    canExportData: true,
  },
  editor: {
    canViewProperties: true,
    canEditProperties: true,
    canDeleteProperties: false,
    canVerifyData: true,
    canGenerateDesigns: true,
    canApproveDesigns: false,
    canDeleteDesigns: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canDelegateToAgents: true,
    canConfigureAgents: false,
    canManageSettings: false,
    canArchiveWorkspace: false,
    canExportData: true,
  },
  commenter: {
    canViewProperties: true,
    canEditProperties: false,
    canDeleteProperties: false,
    canVerifyData: false,
    canGenerateDesigns: false,
    canApproveDesigns: false,
    canDeleteDesigns: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canDelegateToAgents: false,
    canConfigureAgents: false,
    canManageSettings: false,
    canArchiveWorkspace: false,
    canExportData: false,
  },
  viewer: {
    canViewProperties: true,
    canEditProperties: false,
    canDeleteProperties: false,
    canVerifyData: false,
    canGenerateDesigns: false,
    canApproveDesigns: false,
    canDeleteDesigns: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canDelegateToAgents: false,
    canConfigureAgents: false,
    canManageSettings: false,
    canArchiveWorkspace: false,
    canExportData: false,
  },
};

export const ORG_ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermissions> = {
  owner: {
    canManageMembers: true,
    canManageBilling: true,
    canManageSettings: true,
    canCreateProjects: true,
    canManageAiAgents: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  admin: {
    canManageMembers: true,
    canManageBilling: false,
    canManageSettings: true,
    canCreateProjects: true,
    canManageAiAgents: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  member: {
    canManageMembers: false,
    canManageBilling: false,
    canManageSettings: false,
    canCreateProjects: true,
    canManageAiAgents: false,
    canViewAnalytics: false,
    canExportData: false,
  },
  billing: {
    canManageMembers: false,
    canManageBilling: true,
    canManageSettings: false,
    canCreateProjects: false,
    canManageAiAgents: false,
    canViewAnalytics: true,
    canExportData: false,
  },
};

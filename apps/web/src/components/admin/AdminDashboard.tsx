import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Bot,
  Activity,
  Settings,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  Server,
  Database,
  Shield,
} from 'lucide-react';

type AdminView = 'overview' | 'organizations' | 'users' | 'agents' | 'activity' | 'settings';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: string;
}

// Mock data - replace with real API calls
const mockMetrics: MetricCard[] = [
  {
    label: 'Total Organizations',
    value: 47,
    change: 12,
    changeLabel: 'this month',
    icon: <Building2 className="w-5 h-5" />,
    status: 'success',
  },
  {
    label: 'Active Users',
    value: 312,
    change: 8.5,
    changeLabel: 'vs last week',
    icon: <Users className="w-5 h-5" />,
    status: 'success',
  },
  {
    label: 'AI Agents',
    value: 23,
    change: -2,
    changeLabel: 'paused',
    icon: <Bot className="w-5 h-5" />,
    status: 'warning',
  },
  {
    label: 'Tasks Today',
    value: 1247,
    change: 34,
    changeLabel: 'completed',
    icon: <Activity className="w-5 h-5" />,
    status: 'neutral',
  },
];

const mockApiMetrics = {
  gemini: {
    calls: 4521,
    tokens: 2_340_000,
    cost: 47.82,
    errorRate: 0.3,
  },
  firecrawl: {
    scrapes: 892,
    successRate: 94.2,
    cost: 22.30,
  },
};

const mockSystemHealth: SystemHealth[] = [
  { service: 'Gemini API', status: 'healthy', latency: 234, lastCheck: '2 min ago' },
  { service: 'Firecrawl', status: 'healthy', latency: 1240, lastCheck: '2 min ago' },
  { service: 'Database', status: 'healthy', latency: 12, lastCheck: '1 min ago' },
  { service: 'Storage (S3)', status: 'degraded', latency: 890, lastCheck: '2 min ago' },
];

const mockRecentActivity = [
  { type: 'agent.task-completed', actor: 'PropertyBot', target: '123 Main St', time: '2 min ago' },
  { type: 'user.joined', actor: 'sarah@acme.co', target: 'Acme Renovations', time: '15 min ago' },
  { type: 'design.generated', actor: 'DesignAgent-01', target: 'Modern Kitchen', time: '32 min ago' },
  { type: 'property.verified', actor: 'DataVerifier', target: '456 Oak Ave', time: '1 hour ago' },
  { type: 'agent.task-failed', actor: 'CostEstimator', target: 'Budget Analysis', time: '2 hours ago' },
];

export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('overview');

  const navItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'organizations', label: 'Organizations', icon: <Building2 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'agents', label: 'AI Agents', icon: <Bot className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Admin Console</h1>
              <p className="text-xs text-slate-500">Platform Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Server className="w-3 h-3" />
              System Status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-400">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'organizations' && <ComingSoonView title="Organizations" />}
        {activeView === 'users' && <ComingSoonView title="Users" />}
        {activeView === 'agents' && <AgentsView />}
        {activeView === 'activity' && <ActivityView />}
        {activeView === 'settings' && <ComingSoonView title="Settings" />}
      </main>
    </div>
  );
};

const OverviewView: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-slate-400 mt-1">Monitor system health, usage, and key metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          Last updated: Just now
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {mockMetrics.map((metric, i) => (
          <div
            key={i}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                metric.status === 'success' ? 'bg-green-500/10 text-green-400' :
                metric.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                metric.status === 'error' ? 'bg-red-500/10 text-red-400' :
                'bg-slate-700/50 text-slate-400'
              }`}>
                {metric.icon}
              </div>
              {metric.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${
                  metric.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </div>
            <div className="text-sm text-slate-500">{metric.label}</div>
            {metric.changeLabel && (
              <div className="text-xs text-slate-600 mt-1">{metric.changeLabel}</div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* API Usage */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            API Usage (Today)
          </h3>

          <div className="space-y-4">
            {/* Gemini */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Google Gemini</span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {100 - mockApiMetrics.gemini.errorRate}% success
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{mockApiMetrics.gemini.calls.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">API Calls</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{(mockApiMetrics.gemini.tokens / 1_000_000).toFixed(1)}M</div>
                  <div className="text-xs text-slate-500">Tokens</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">${mockApiMetrics.gemini.cost.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Cost</div>
                </div>
              </div>
            </div>

            {/* Firecrawl */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Firecrawl</span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {mockApiMetrics.firecrawl.successRate}% success
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{mockApiMetrics.firecrawl.scrapes.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Scrapes</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">${mockApiMetrics.firecrawl.cost.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Cost</div>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <span className="text-sm text-slate-400">Total API Spend</span>
              <span className="text-lg font-bold text-white flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                {(mockApiMetrics.gemini.cost + mockApiMetrics.firecrawl.cost).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            System Health
          </h3>

          <div className="space-y-3">
            {mockSystemHealth.map((service, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-slate-300">{service.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  {service.latency && (
                    <span className="text-xs text-slate-500">{service.latency}ms</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    service.status === 'healthy' ? 'bg-green-500/10 text-green-400' :
                    service.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            Recent Activity
          </h3>
          <button className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {mockRecentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type.includes('completed') ? 'bg-green-500/10 text-green-400' :
                  activity.type.includes('failed') ? 'bg-red-500/10 text-red-400' :
                  activity.type.includes('agent') ? 'bg-violet-500/10 text-violet-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {activity.type.includes('agent') ? <Bot className="w-4 h-4" /> :
                   activity.type.includes('user') ? <Users className="w-4 h-4" /> :
                   activity.type.includes('design') ? <Zap className="w-4 h-4" /> :
                   <Database className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm text-slate-300">
                    <span className="font-medium text-white">{activity.actor}</span>
                    {' '}{activity.type.split('.')[1]?.replace('-', ' ')}
                    {' '}<span className="text-slate-400">{activity.target}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AgentsView: React.FC = () => {
  const mockAgents = [
    { id: '1', name: 'PropertyBot', status: 'active', tasks: 234, successRate: 98.2, cost: 12.50, capabilities: ['property-research', 'document-analysis'] },
    { id: '2', name: 'DesignAgent-01', status: 'active', tasks: 89, successRate: 95.5, cost: 34.20, capabilities: ['design-generation'] },
    { id: '3', name: 'DataVerifier', status: 'active', tasks: 456, successRate: 99.1, cost: 8.30, capabilities: ['quality-review', 'measurement-extraction'] },
    { id: '4', name: 'CostEstimator', status: 'paused', tasks: 67, successRate: 87.3, cost: 5.60, capabilities: ['cost-estimation'] },
    { id: '5', name: 'ReportWriter', status: 'active', tasks: 23, successRate: 100, cost: 3.40, capabilities: ['report-generation', 'communication'] },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-slate-400 mt-1">Manage autonomous workers across the platform</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">5</div>
          <div className="text-sm text-slate-500">Total Agents</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">4</div>
          <div className="text-sm text-slate-500">Active</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">869</div>
          <div className="text-sm text-slate-500">Tasks Today</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">$64.00</div>
          <div className="text-sm text-slate-500">Total Cost</div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Agent</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Capabilities</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Tasks</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Success</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Cost</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mockAgents.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="font-medium text-white">{agent.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    {agent.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {agent.capabilities.slice(0, 2).map((cap) => (
                      <span key={cap} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded">
                        {cap.replace('-', ' ')}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="text-xs text-slate-500">+{agent.capabilities.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-300">{agent.tasks}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm ${agent.successRate >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {agent.successRate}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-300">${agent.cost.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-violet-400 hover:text-violet-300">Configure</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ActivityView: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 mt-1">Audit trail of all platform actions</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
            <option>All Types</option>
            <option>User Actions</option>
            <option>Agent Actions</option>
            <option>System Events</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-800/50 last:border-0">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                {i % 3 === 0 ? <Bot className="w-5 h-5 text-violet-400" /> :
                 i % 3 === 1 ? <Users className="w-5 h-5 text-blue-400" /> :
                 <Database className="w-5 h-5 text-green-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-white">
                    {i % 3 === 0 ? 'PropertyBot' : i % 3 === 1 ? 'john@example.com' : 'System'}
                  </span>
                  <span className="text-slate-400">
                    {i % 4 === 0 ? 'completed property research for' :
                     i % 4 === 1 ? 'joined workspace' :
                     i % 4 === 2 ? 'generated design revision' :
                     'updated system configuration'}
                  </span>
                  <span className="text-white font-medium truncate">
                    {i % 4 === 0 ? '123 Main St' :
                     i % 4 === 1 ? 'Downtown Loft Project' :
                     i % 4 === 2 ? 'Modern Kitchen v3' :
                     'API rate limits'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500">{i * 2 + 1} minutes ago</span>
                  <span className="text-xs text-slate-600">ID: act_{String(i + 1).padStart(6, '0')}</span>
                </div>
              </div>
              <button className="text-xs text-slate-500 hover:text-slate-300">Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComingSoonView: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-slate-400">This section is under construction</p>
      </div>
    </div>
  );
};

export default AdminDashboard;

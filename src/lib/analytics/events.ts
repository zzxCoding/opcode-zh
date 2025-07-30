import type { 
  EventName,
  FeatureUsageProperties,
  ErrorProperties,
  SessionProperties,
  ModelProperties,
  AgentProperties,
  MCPProperties,
  SlashCommandProperties,
  PerformanceMetrics 
} from './types';

export const ANALYTICS_EVENTS = {
  // Session events
  SESSION_CREATED: 'session_created' as EventName,
  SESSION_COMPLETED: 'session_completed' as EventName,
  SESSION_RESUMED: 'session_resumed' as EventName,
  
  // Feature usage events
  FEATURE_USED: 'feature_used' as EventName,
  MODEL_SELECTED: 'model_selected' as EventName,
  TAB_CREATED: 'tab_created' as EventName,
  TAB_CLOSED: 'tab_closed' as EventName,
  FILE_OPENED: 'file_opened' as EventName,
  FILE_EDITED: 'file_edited' as EventName,
  FILE_SAVED: 'file_saved' as EventName,
  AGENT_EXECUTED: 'agent_executed' as EventName,
  MCP_SERVER_CONNECTED: 'mcp_server_connected' as EventName,
  MCP_SERVER_DISCONNECTED: 'mcp_server_disconnected' as EventName,
  SLASH_COMMAND_USED: 'slash_command_used' as EventName,
  
  // Settings and system events
  SETTINGS_CHANGED: 'settings_changed' as EventName,
  APP_STARTED: 'app_started' as EventName,
  APP_CLOSED: 'app_closed' as EventName,
  
  // Error events
  ERROR_OCCURRED: 'error_occurred' as EventName,
} as const;

// Event property builders - help ensure consistent event structure
export const eventBuilders = {
  session: (props: SessionProperties) => ({
    event: ANALYTICS_EVENTS.SESSION_CREATED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  feature: (feature: string, subfeature?: string, metadata?: Record<string, any>) => ({
    event: ANALYTICS_EVENTS.FEATURE_USED,
    properties: {
      category: 'feature',
      feature,
      subfeature,
      ...metadata,
    } as FeatureUsageProperties,
  }),
  
  error: (errorType: string, errorCode?: string, context?: string) => ({
    event: ANALYTICS_EVENTS.ERROR_OCCURRED,
    properties: {
      category: 'error',
      error_type: errorType,
      error_code: errorCode,
      context,
    } as ErrorProperties,
  }),
  
  model: (newModel: string, previousModel?: string, source?: string) => ({
    event: ANALYTICS_EVENTS.MODEL_SELECTED,
    properties: {
      category: 'model',
      new_model: newModel,
      previous_model: previousModel,
      source,
    } as ModelProperties,
  }),
  
  agent: (agentType: string, success: boolean, agentName?: string, durationMs?: number) => ({
    event: ANALYTICS_EVENTS.AGENT_EXECUTED,
    properties: {
      category: 'agent',
      agent_type: agentType,
      agent_name: agentName,
      success,
      duration_ms: durationMs,
    } as AgentProperties,
  }),
  
  mcp: (serverName: string, success: boolean, serverType?: string) => ({
    event: ANALYTICS_EVENTS.MCP_SERVER_CONNECTED,
    properties: {
      category: 'mcp',
      server_name: serverName,
      server_type: serverType,
      success,
    } as MCPProperties,
  }),
  
  slashCommand: (command: string, success: boolean) => ({
    event: ANALYTICS_EVENTS.SLASH_COMMAND_USED,
    properties: {
      category: 'slash_command',
      command,
      success,
    } as SlashCommandProperties,
  }),
  
  performance: (metrics: PerformanceMetrics) => ({
    event: ANALYTICS_EVENTS.FEATURE_USED,
    properties: {
      category: 'performance',
      feature: 'system_metrics',
      ...metrics,
    },
  }),
};

// Sanitization helpers to remove PII
export const sanitizers = {
  // Remove file paths, keeping only extension
  sanitizeFilePath: (path: string): string => {
    const ext = path.split('.').pop();
    return ext ? `*.${ext}` : 'unknown';
  },
  
  // Remove project names and paths
  sanitizeProjectPath: (_path: string): string => {
    return 'project';
  },
  
  // Sanitize error messages that might contain sensitive info
  sanitizeErrorMessage: (message: string): string => {
    // Remove file paths
    message = message.replace(/\/[\w\-\/\.]+/g, '/***');
    // Remove potential API keys or tokens
    message = message.replace(/[a-zA-Z0-9]{20,}/g, '***');
    // Remove email addresses
    message = message.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '***@***.***');
    return message;
  },
  
  // Sanitize agent names that might contain user info
  sanitizeAgentName: (name: string): string => {
    // Only keep the type, remove custom names
    return name.split('-')[0] || 'custom';
  },
};
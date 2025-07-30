export interface AnalyticsEvent {
  event: string;
  properties?: {
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  };
  timestamp: number;
  sessionId: string;
  userId: string; // anonymous UUID
}

export interface AnalyticsSettings {
  enabled: boolean;
  hasConsented: boolean;
  consentDate?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  apiKey: string;
  apiHost?: string;
  persistence?: 'localStorage' | 'memory';
  autocapture?: boolean;
  disable_session_recording?: boolean;
  opt_out_capturing_by_default?: boolean;
  loaded?: (posthog: any) => void;
}

export type EventName = 
  | 'session_created'
  | 'session_completed'
  | 'session_resumed'
  | 'feature_used'
  | 'error_occurred'
  | 'model_selected'
  | 'tab_created'
  | 'tab_closed'
  | 'file_opened'
  | 'file_edited'
  | 'file_saved'
  | 'agent_executed'
  | 'mcp_server_connected'
  | 'mcp_server_disconnected'
  | 'slash_command_used'
  | 'settings_changed'
  | 'app_started'
  | 'app_closed';

export interface FeatureUsageProperties {
  feature: string;
  subfeature?: string;
  metadata?: Record<string, any>;
}

export interface ErrorProperties {
  error_type: string;
  error_code?: string;
  error_message?: string;
  context?: string;
}

export interface SessionProperties {
  model?: string;
  source?: string;
  resumed?: boolean;
  checkpoint_id?: string;
}

export interface ModelProperties {
  previous_model?: string;
  new_model: string;
  source?: string;
}

export interface AgentProperties {
  agent_type: string;
  agent_name?: string;
  success: boolean;
  duration_ms?: number;
}

export interface MCPProperties {
  server_name: string;
  server_type?: string;
  success: boolean;
}

export interface SlashCommandProperties {
  command: string;
  success: boolean;
}

export interface PerformanceMetrics {
  startup_time_ms?: number;
  memory_usage_mb?: number;
  api_response_time_ms?: number;
  render_time_ms?: number;
}
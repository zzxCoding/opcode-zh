import { useCallback, useEffect, useRef } from 'react';
import { analytics, ANALYTICS_EVENTS, eventBuilders } from '@/lib/analytics';
import type { EventName } from '@/lib/analytics/types';

interface UseAnalyticsReturn {
  track: (eventName: EventName | string, properties?: Record<string, any>) => void;
  trackEvent: ReturnType<typeof useTrackEvent>;
  isEnabled: boolean;
  hasConsented: boolean;
}

export function useAnalytics(): UseAnalyticsReturn {
  const isEnabled = analytics.isEnabled();
  const hasConsented = analytics.hasConsented();
  
  const track = useCallback((eventName: EventName | string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, []);
  
  const trackEvent = useTrackEvent();
  
  return {
    track,
    trackEvent,
    isEnabled,
    hasConsented,
  };
}

export function useTrackEvent() {
  return {
    // Session events
    sessionCreated: (model: string, source?: string) => {
      const event = eventBuilders.session({ model, source });
      analytics.track(event.event, event.properties);
    },
    
    sessionCompleted: () => {
      analytics.track(ANALYTICS_EVENTS.SESSION_COMPLETED);
    },
    
    sessionResumed: (checkpointId: string) => {
      const event = eventBuilders.session({ resumed: true, checkpoint_id: checkpointId });
      analytics.track(ANALYTICS_EVENTS.SESSION_RESUMED, event.properties);
    },
    
    // Feature usage
    featureUsed: (feature: string, subfeature?: string, metadata?: Record<string, any>) => {
      const event = eventBuilders.feature(feature, subfeature, metadata);
      analytics.track(event.event, event.properties);
    },
    
    // Model selection
    modelSelected: (newModel: string, previousModel?: string, source?: string) => {
      const event = eventBuilders.model(newModel, previousModel, source);
      analytics.track(event.event, event.properties);
    },
    
    // Tab events
    tabCreated: (tabType: string) => {
      analytics.track(ANALYTICS_EVENTS.TAB_CREATED, { tab_type: tabType });
    },
    
    tabClosed: (tabType: string) => {
      analytics.track(ANALYTICS_EVENTS.TAB_CLOSED, { tab_type: tabType });
    },
    
    // File operations
    fileOpened: (fileType: string) => {
      analytics.track(ANALYTICS_EVENTS.FILE_OPENED, { file_type: fileType });
    },
    
    fileEdited: (fileType: string) => {
      analytics.track(ANALYTICS_EVENTS.FILE_EDITED, { file_type: fileType });
    },
    
    fileSaved: (fileType: string) => {
      analytics.track(ANALYTICS_EVENTS.FILE_SAVED, { file_type: fileType });
    },
    
    // Agent execution
    agentExecuted: (agentType: string, success: boolean, agentName?: string, durationMs?: number) => {
      const event = eventBuilders.agent(agentType, success, agentName, durationMs);
      analytics.track(event.event, event.properties);
    },
    
    // MCP events
    mcpServerConnected: (serverName: string, success: boolean, serverType?: string) => {
      const event = eventBuilders.mcp(serverName, success, serverType);
      analytics.track(event.event, event.properties);
    },
    
    mcpServerDisconnected: (serverName: string) => {
      analytics.track(ANALYTICS_EVENTS.MCP_SERVER_DISCONNECTED, { server_name: serverName });
    },
    
    // Slash commands
    slashCommandUsed: (command: string, success: boolean) => {
      const event = eventBuilders.slashCommand(command, success);
      analytics.track(event.event, event.properties);
    },
    
    // Settings
    settingsChanged: (setting: string, value: any) => {
      analytics.track(ANALYTICS_EVENTS.SETTINGS_CHANGED, { setting, value });
    },
    
    // Errors
    errorOccurred: (errorType: string, errorCode?: string, context?: string) => {
      const event = eventBuilders.error(errorType, errorCode, context);
      analytics.track(event.event, event.properties);
    },
    
    // Performance
    performanceMetrics: (metrics: Record<string, number>) => {
      const event = eventBuilders.performance(metrics);
      analytics.track(event.event, event.properties);
    },
  };
}

export function usePageView(pageName: string, properties?: Record<string, any>) {
  const hasTracked = useRef(false);
  
  useEffect(() => {
    if (!hasTracked.current && analytics.isEnabled()) {
      analytics.track('page_view', {
        page_name: pageName,
        ...properties,
      });
      hasTracked.current = true;
    }
  }, [pageName, properties]);
}

export function useAppLifecycle() {
  useEffect(() => {
    // Track app start
    analytics.track(ANALYTICS_EVENTS.APP_STARTED);
    
    // Track app close
    const handleUnload = () => {
      analytics.track(ANALYTICS_EVENTS.APP_CLOSED);
      analytics.shutdown();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
}

// Hook for tracking component-specific metrics
export function useComponentMetrics(componentName: string) {
  const mountTime = useRef(Date.now());
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });
  
  useEffect(() => {
    return () => {
      // Track component unmount metrics
      const lifetime = Date.now() - mountTime.current;
      analytics.track('component_metrics', {
        component: componentName,
        lifetime_ms: lifetime,
        render_count: renderCount.current,
      });
    };
  }, [componentName]);
}

// Hook for tracking user interactions
export function useInteractionTracking(interactionType: string) {
  return useCallback((details?: Record<string, any>) => {
    analytics.track('user_interaction', {
      interaction_type: interactionType,
      ...details,
    });
  }, [interactionType]);
}
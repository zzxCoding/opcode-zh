import posthog from 'posthog-js';
import { ConsentManager } from './consent';
import { sanitizers } from './events';
import type { 
  AnalyticsConfig, 
  AnalyticsEvent, 
  EventName,
  AnalyticsSettings 
} from './types';

export * from './types';
export * from './events';
export { ConsentManager } from './consent';

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private consentManager: ConsentManager;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.consentManager = ConsentManager.getInstance();
    
    // Default configuration - pulled from Vite environment variables
    this.config = {
      apiKey: import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_YOUR_PROJECT_API_KEY',
      apiHost: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      persistence: 'localStorage',
      autocapture: false, // We'll manually track events
      disable_session_recording: true, // Privacy first
      opt_out_capturing_by_default: true, // Require explicit opt-in
    };
  }
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize consent manager
      const settings = await this.consentManager.initialize();
      
      // Only initialize PostHog if user has consented
      if (settings.hasConsented && settings.enabled) {
        this.initializePostHog(settings);
      }
      
      // Start event queue flush interval
      this.startFlushInterval();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }
  
  private initializePostHog(settings: AnalyticsSettings): void {
    try {
      posthog.init(this.config.apiKey, {
        api_host: this.config.apiHost,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
        persistence: this.config.persistence,
        autocapture: this.config.autocapture,
        disable_session_recording: this.config.disable_session_recording,
        opt_out_capturing_by_default: this.config.opt_out_capturing_by_default,
        loaded: (ph) => {
          // Set user properties
          ph.identify(settings.userId, {
            anonymous: true,
            consent_date: settings.consentDate,
          });
          
          // Opt in since user has consented
          ph.opt_in_capturing();
          
          if (this.config.loaded) {
            this.config.loaded(ph);
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }
  
  async enable(): Promise<void> {
    await this.consentManager.grantConsent();
    const settings = this.consentManager.getSettings();
    if (settings) {
      this.initializePostHog(settings);
    }
  }
  
  async disable(): Promise<void> {
    await this.consentManager.revokeConsent();
    if (typeof posthog !== 'undefined' && posthog.opt_out_capturing) {
      posthog.opt_out_capturing();
    }
  }
  
  async deleteAllData(): Promise<void> {
    await this.consentManager.deleteAllData();
    if (typeof posthog !== 'undefined' && posthog.reset) {
      posthog.reset();
    }
  }
  
  track(eventName: EventName | string, properties?: Record<string, any>): void {
    // Check if analytics is enabled
    if (!this.consentManager.isEnabled()) {
      return;
    }
    
    // Sanitize properties to remove PII
    const sanitizedProperties = this.sanitizeProperties(properties || {});
    
    // Create event
    const event: AnalyticsEvent = {
      event: eventName,
      properties: sanitizedProperties,
      timestamp: Date.now(),
      sessionId: this.consentManager.getSessionId(),
      userId: this.consentManager.getUserId(),
    };
    
    // Add to queue
    this.eventQueue.push(event);
    
    // Send immediately if PostHog is initialized
    if (typeof posthog !== 'undefined' && typeof posthog.capture === 'function') {
      this.flushEvents();
    }
  }
  
  identify(traits?: Record<string, any>): void {
    if (!this.consentManager.isEnabled()) {
      return;
    }
    
    const userId = this.consentManager.getUserId();
    const sanitizedTraits = this.sanitizeProperties(traits || {});
    
    if (typeof posthog !== 'undefined' && posthog.identify) {
      posthog.identify(userId, {
        ...sanitizedTraits,
        anonymous: true,
      });
    }
  }
  
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Skip null/undefined values
      if (value == null) continue;
      
      // Apply specific sanitizers based on key
      if (key.includes('path') || key.includes('file')) {
        sanitized[key] = typeof value === 'string' ? sanitizers.sanitizeFilePath(value) : value;
      } else if (key.includes('project')) {
        sanitized[key] = typeof value === 'string' ? sanitizers.sanitizeProjectPath(value) : value;
      } else if (key.includes('error') || key.includes('message')) {
        sanitized[key] = typeof value === 'string' ? sanitizers.sanitizeErrorMessage(value) : value;
      } else if (key.includes('agent_name')) {
        sanitized[key] = typeof value === 'string' ? sanitizers.sanitizeAgentName(value) : value;
      } else {
        // For other properties, ensure no PII
        if (typeof value === 'string') {
          // Remove potential file paths
          let cleanValue = value.replace(/\/[\w\-\/\.]+/g, '/***');
          // Remove potential API keys
          cleanValue = cleanValue.replace(/[a-zA-Z0-9]{32,}/g, '***');
          // Remove emails
          cleanValue = cleanValue.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '***@***.***');
          sanitized[key] = cleanValue;
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  }
  
  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    events.forEach(event => {
      if (typeof posthog !== 'undefined' && posthog.capture) {
        posthog.capture(event.event, {
          ...event.properties,
          $session_id: event.sessionId,
          timestamp: event.timestamp,
        });
      }
    });
  }
  
  private startFlushInterval(): void {
    // Flush events every 5 seconds
    this.flushInterval = setInterval(() => {
      if (this.consentManager.isEnabled()) {
        this.flushEvents();
      }
    }, 5000);
  }
  
  shutdown(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Flush any remaining events
    this.flushEvents();
  }
  
  // Convenience methods
  isEnabled(): boolean {
    return this.consentManager.isEnabled();
  }
  
  hasConsented(): boolean {
    return this.consentManager.hasConsented();
  }
  
  getSettings(): AnalyticsSettings | null {
    return this.consentManager.getSettings();
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Export for direct usage
export default analytics;

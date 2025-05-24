import posthog from 'posthog-js';

// Initialize PostHog with your project API key
export const initAnalytics = () => {
  // Only initialize in production environment to avoid tracking development activity
  if (import.meta.env.PROD) {
    posthog.init(
      import.meta.env.VITE_POSTHOG_API_KEY || '',
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        // Enable debug mode in development
        debug: import.meta.env.DEV,
        // Disable autocapture if you want to manually track events only
        autocapture: true,
        // Capture pageviews
        capture_pageview: true,
        // Disable persistence to respect privacy regulations if needed
        persistence: 'localStorage',
      }
    );
    
    console.log('PostHog analytics initialized with key:', import.meta.env.VITE_POSTHOG_API_KEY?.substring(0, 4) + '...');
    console.log('PostHog host:', import.meta.env.VITE_POSTHOG_HOST);
  } else {
    console.log('PostHog analytics not initialized in development mode');
  }
};

// Utility to track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    posthog.capture(eventName, properties);
  } else {
    console.log(`Event tracked (dev mode): ${eventName}`, properties);
  }
};

// Utility to identify users (if you implement authentication later)
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    posthog.identify(userId, traits);
  } else {
    console.log(`User identified (dev mode): ${userId}`, traits);
  }
};

// Track page views manually if needed
export const trackPageView = (url?: string) => {
  if (import.meta.env.PROD) {
    posthog.capture('$pageview', { url: url || window.location.href });
  } else {
    console.log(`Page view tracked (dev mode): ${url || window.location.href}`);
  }
};

// Reset user identification when needed (e.g., logout)
export const resetAnalyticsUser = () => {
  if (import.meta.env.PROD) {
    posthog.reset();
  } else {
    console.log('Analytics user reset (dev mode)');
  }
};

// Opt out of tracking (for GDPR compliance)
export const optOut = () => {
  posthog.opt_out_capturing();
};

// Opt in to tracking after previously opting out
export const optIn = () => {
  posthog.opt_in_capturing();
};

// Check if user has opted out
export const hasOptedOut = (): boolean => {
  return posthog.has_opted_out_capturing();
};
export const trackEvent = (eventName, params = {}) => {
  // PostHog — use the global instance initialized by PostHogProvider
  try {
    if (window.posthog) {
      window.posthog.capture(eventName, params);
    }
  } catch (e) {
    console.warn("PostHog trackEvent failed:", e);
  }

  // GTM dataLayer
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
  } catch (e) {
    console.warn("GTM trackEvent failed:", e);
  }
};

export const trackEvent = (eventName, params = {}) => {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
  } catch (e) {
    console.warn("GTM trackEvent failed:", e);
  }
};

import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-BJN5XG7G03";

let initialized = false;

export function initAnalytics() {
  if (initialized) return;

  ReactGA.initialize(GA_MEASUREMENT_ID);
  initialized = true;
}

export function trackEvent(eventName, parameters = {}) {
  if (!initialized) return;

  ReactGA.event(eventName, parameters);
}
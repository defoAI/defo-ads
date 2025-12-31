// File: src/firebase.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Firebase Analytics initialization - only active in production builds

import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBlrwHxNO7pO2ImV1fM7QmWvyJZUcO-4_g",
  authDomain: "defo--ads.firebaseapp.com",
  projectId: "defo--ads",
  storageBucket: "defo--ads.firebasestorage.app",
  messagingSenderId: "473591404390",
  appId: "1:473591404390:web:a0cc51c3a878b10ffd1aa7",
  measurementId: "G-KZDW5B73MJ"
};

const CONSENT_KEY = 'defo_analytics_consent';

let app = null;
let analytics = null;

/**
 * Check if analytics should be enabled (production build only)
 */
export const isAnalyticsEnabled = () => {
  return import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
};

/**
 * Get the stored consent preference
 * @returns {'accepted' | 'declined' | null}
 */
export const getConsentPreference = () => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

/**
 * Store the consent preference
 * @param {'accepted' | 'declined'} preference
 */
export const setConsentPreference = (preference) => {
  try {
    localStorage.setItem(CONSENT_KEY, preference);
  } catch {
    // localStorage not available
  }
};

/**
 * Initialize Firebase Analytics (only if consented and in production)
 */
export const initializeAnalytics = () => {
  if (!isAnalyticsEnabled()) {
    console.log('[Firebase] Analytics disabled - not a production build');
    return false;
  }

  if (getConsentPreference() !== 'accepted') {
    console.log('[Firebase] Analytics disabled - no user consent');
    return false;
  }

  if (analytics) {
    console.log('[Firebase] Analytics already initialized');
    return true;
  }

  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log('[Firebase] Analytics initialized successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to initialize analytics:', error);
    return false;
  }
};

/**
 * Log an analytics event (no-op if analytics not initialized)
 * @param {string} eventName
 * @param {object} eventParams
 */
export const logEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams);
  }
};

export { analytics };

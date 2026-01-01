// File: src/services/dataService.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Extensible Data Service with provider injection pattern.
// Default: Local storage via Zustand
// Extensions can register custom providers for cloud routing

// ============================================================================
// Provider Registry - Allows extensions to override data storage
// ============================================================================

/**
 * @typedef {Object} DataProvider
 * @property {'cloud'|'hybrid'} type - Provider type
 * @property {() => Promise<Object[]>} getCampaigns
 * @property {(data: Object) => Promise<Object>} saveCampaign
 * @property {(ids: string[]) => Promise<void>} deleteCampaigns
 * @property {() => Promise<Object[]>} getAdGroups
 * @property {(data: Object) => Promise<Object>} saveAdGroup
 * @property {(ids: string[]) => Promise<void>} deleteAdGroups
 * @property {() => Promise<Object[]>} getKeywords
 * @property {(data: Object) => Promise<Object>} saveKeyword
 * @property {(ids: string[]) => Promise<void>} deleteKeywords
 * @property {() => Promise<Object[]>} getAds
 * @property {(data: Object) => Promise<Object>} saveAd
 * @property {(ids: string[]) => Promise<void>} deleteAds
 * @property {() => Promise<Object[]>} getSites
 * @property {(data: Object) => Promise<Object>} saveSite
 * @property {(ids: string[]) => Promise<void>} deleteSites
 * @property {(localData: Object) => Promise<void>} migrateFromLocal - Migrate localStorage data to cloud
 */

/** @type {DataProvider|null} */
let customProvider = null;

/** @type {Set<Function>} */
const listeners = new Set();

/**
 * Register a custom data provider.
 * This allows extensions to inject their own storage logic.
 * 
 * @param {DataProvider} provider - Provider implementing data operations
 */
export const registerDataProvider = (provider) => {
    customProvider = provider;
    // Notify listeners of provider change
    listeners.forEach(fn => fn(getStorageType()));
};

/**
 * Unregister the custom data provider (for logout/cleanup)
 */
export const unregisterDataProvider = () => {
    customProvider = null;
    listeners.forEach(fn => fn(getStorageType()));
};

/**
 * Get the current storage type
 * @returns {'cloud'|'local'}
 */
export const getStorageType = () => {
    return customProvider ? 'cloud' : 'local';
};

/**
 * Check if a cloud provider is active
 * @returns {boolean}
 */
export const isCloudStorage = () => {
    return customProvider !== null;
};

/**
 * Subscribe to storage type changes
 * @param {Function} callback - Called with new storage type
 * @returns {Function} Unsubscribe function
 */
export const subscribeToStorageChanges = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

/**
 * Get the active data provider (cloud or null for local)
 * @returns {DataProvider|null}
 */
export const getDataProvider = () => customProvider;

// ============================================================================
// Data Migration
// ============================================================================

/**
 * Migrate local data to cloud storage
 * Should be called after user signs up for premium
 * @param {Object} localData - Data from localStorage/Zustand
 * @returns {Promise<{success: boolean, migrated: Object}>}
 */
export const migrateToCloud = async (localData) => {
    if (!customProvider || !customProvider.migrateFromLocal) {
        throw new Error('No cloud provider registered or migration not supported');
    }

    return customProvider.migrateFromLocal(localData);
};

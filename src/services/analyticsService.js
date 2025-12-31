// File: src/services/analyticsService.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Centralized analytics service for tracking user interactions.
// All events are no-ops if analytics is not initialized (disabled or no consent).

import { logEvent } from '../firebase';

// ============================================================================
// PAGE / NAVIGATION EVENTS
// ============================================================================

/**
 * Track page views
 * @param {string} pageName - Name of the page (e.g., 'campaigns', 'sites', 'settings')
 */
export const trackPageView = (pageName) => {
    logEvent('page_view', {
        page_name: pageName,
        page_location: window.location.pathname,
    });
};

// ============================================================================
// IMPORT / EXPORT EVENTS
// ============================================================================

/**
 * Track when import dialog is opened
 */
export const trackImportDialogOpen = () => {
    logEvent('import_dialog_open');
};

/**
 * Track successful data import
 * @param {string} method - 'file' or 'paste'
 * @param {object} stats - { campaigns, adGroups, keywords, ads }
 */
export const trackImportSuccess = (method, stats) => {
    logEvent('import_success', {
        method,
        campaigns_count: stats.campaigns || 0,
        ad_groups_count: stats.adGroups || 0,
        keywords_count: stats.keywords || 0,
        ads_count: stats.ads || 0,
        total_entities: (stats.campaigns || 0) + (stats.adGroups || 0) + (stats.keywords || 0) + (stats.ads || 0),
    });
};

/**
 * Track import failure
 * @param {string} method - 'file' or 'paste'
 * @param {string} error - Error message
 */
export const trackImportError = (method, error) => {
    logEvent('import_error', {
        method,
        error_message: error?.substring(0, 100), // Limit error length
    });
};

/**
 * Track when export dialog is opened
 */
export const trackExportDialogOpen = () => {
    logEvent('export_dialog_open');
};

/**
 * Track successful data export
 * @param {string} format - 'json', 'csv', or 'tsv'
 * @param {object} entities - Selected entity types
 */
export const trackExportSuccess = (format, entities) => {
    logEvent('export_success', {
        format,
        includes_sites: entities.sites || false,
        includes_campaigns: entities.campaigns || false,
        includes_ad_groups: entities.adGroups || false,
        includes_keywords: entities.keywords || false,
        includes_ads: entities.ads || false,
    });
};

// ============================================================================
// CAMPAIGN EVENTS
// ============================================================================

/**
 * Track when campaign creation dialog is opened
 */
export const trackCampaignDialogOpen = () => {
    logEvent('campaign_dialog_open');
};

/**
 * Track successful campaign creation
 * @param {string} method - 'manual' or 'ai'
 * @param {object} details - { type, generateAdGroups, generateKeywords, generateAds }
 */
export const trackCampaignCreated = (method, details = {}) => {
    logEvent('campaign_created', {
        method,
        campaign_type: details.type || 'unknown',
        ai_generated_ad_groups: details.generateAdGroups || false,
        ai_generated_keywords: details.generateKeywords || false,
        ai_generated_ads: details.generateAds || false,
    });
};

/**
 * Track campaign deletion
 * @param {number} count - Number of campaigns deleted
 */
export const trackCampaignDeleted = (count) => {
    logEvent('campaign_deleted', { count });
};

// ============================================================================
// SITE EVENTS
// ============================================================================

/**
 * Track when site creation dialog is opened
 */
export const trackSiteDialogOpen = () => {
    logEvent('site_dialog_open');
};

/**
 * Track successful site creation
 * @param {boolean} aiAssisted - Whether AI was used to analyze the site
 */
export const trackSiteCreated = (aiAssisted = false) => {
    logEvent('site_created', { ai_assisted: aiAssisted });
};

/**
 * Track site update (edit)
 */
export const trackSiteUpdated = () => {
    logEvent('site_updated');
};

/**
 * Track site deletion
 * @param {number} count - Number of sites deleted
 */
export const trackSiteDeleted = (count) => {
    logEvent('site_deleted', { count });
};

// ============================================================================
// AD EVENTS
// ============================================================================

/**
 * Track ad update (edit)
 */
export const trackAdUpdated = () => {
    logEvent('ad_updated');
};

/**
 * Track ad translation
 * @param {string} targetLanguage - Language code (e.g., 'de', 'fr')
 */
export const trackAdTranslation = (targetLanguage) => {
    logEvent('ad_translation', { target_language: targetLanguage });
};

/**
 * Track sitelink generation
 * @param {boolean} aiGenerated - Whether sitelinks were AI generated
 */
export const trackSitelinksGenerated = (aiGenerated = true) => {
    logEvent('sitelinks_generated', { ai_generated: aiGenerated });
};

// ============================================================================
// ENTITY EVENTS (Ad Groups, Keywords, Ads)
// ============================================================================

/**
 * Track entity deletion
 * @param {string} entityType - 'adGroup', 'keyword', or 'ad'
 * @param {number} count - Number of entities deleted
 */
export const trackEntityDeleted = (entityType, count) => {
    logEvent('entity_deleted', { entity_type: entityType, count });
};

/**
 * Track AI generation of entities
 * @param {string} entityType - 'adGroup', 'keyword', or 'ad'
 * @param {number} count - Number of entities generated
 */
export const trackAiEntityGenerated = (entityType, count) => {
    logEvent('ai_entity_generated', { entity_type: entityType, count });
};

// ============================================================================
// AI ASSIST EVENTS
// ============================================================================

/**
 * Track when AI assist button is clicked
 * @param {string} context - Where the button was clicked (e.g., 'campaign_creation', 'site_analysis')
 */
export const trackAiAssistClick = (context) => {
    logEvent('ai_assist_click', { context });
};

/**
 * Track AI generation success
 * @param {string} context - Context of generation
 * @param {number} durationMs - Time taken in milliseconds
 */
export const trackAiGenerationSuccess = (context, durationMs) => {
    logEvent('ai_generation_success', {
        context,
        duration_ms: durationMs,
    });
};

/**
 * Track AI generation failure
 * @param {string} context - Context of generation
 * @param {string} error - Error message
 */
export const trackAiGenerationError = (context, error) => {
    logEvent('ai_generation_error', {
        context,
        error_message: error?.substring(0, 100),
    });
};

// ============================================================================
// SETTINGS EVENTS
// ============================================================================

/**
 * Track API key saved
 */
export const trackApiKeySaved = () => {
    logEvent('api_key_saved');
};

/**
 * Track data cleared (danger zone)
 */
export const trackDataCleared = () => {
    logEvent('data_cleared');
};

/**
 * Track prompt template edited
 * @param {string} promptId - ID of the edited prompt
 */
export const trackPromptEdited = (promptId) => {
    logEvent('prompt_edited', { prompt_id: promptId });
};

/**
 * Track setting changed
 * @param {string} settingName - Name of the setting
 * @param {any} value - New value
 */
export const trackSettingChanged = (settingName, value) => {
    logEvent('setting_changed', {
        setting_name: settingName,
        setting_value: String(value),
    });
};

// ============================================================================
// ONBOARDING EVENTS
// ============================================================================

/**
 * Track onboarding step completed
 * @param {number} step - Step number (1-4)
 */
export const trackOnboardingStep = (step) => {
    logEvent('onboarding_step', { step });
};

/**
 * Track onboarding completed
 */
export const trackOnboardingComplete = () => {
    logEvent('onboarding_complete');
};

/**
 * Track terms accepted
 */
export const trackTermsAccepted = () => {
    logEvent('terms_accepted');
};

// File: src/services/aiService.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ============================================================================
// Provider Registry
// ============================================================================

/**
 * @typedef {Object} AIProvider
 * @property {(systemPrompt: string, userPrompt: string, options?: Object) => Promise<string>} generateCompletion
 */

/** @type {AIProvider|null} */
let customProvider = null;

/**
 * Register a custom AI provider.
 * This allows extensions to inject their own AI routing logic.
 * 
 * @param {AIProvider} provider - Provider implementing generateCompletion
 * 
 * @example
 * registerAIProvider({
 *   generateCompletion: async (systemPrompt, userPrompt) => {
 *     // Custom routing logic
 *     return await myCustomAICall(systemPrompt, userPrompt);
 *   }
 * });
 */
export const registerAIProvider = (provider) => {
    customProvider = provider;
};

/**
 * Unregister the custom AI provider (for testing/cleanup)
 */
export const unregisterAIProvider = () => {
    customProvider = null;
};

/**
 * Check if a custom provider is registered
 * @returns {boolean}
 */
export const hasCustomProvider = () => customProvider !== null;

// ============================================================================
// Core AI Functions
// ============================================================================

export const parseAiResponse = (response) => {
    try {
        // 1. Try to parse directly
        return JSON.parse(response);
    } catch (e) {
        // 2. Try to extract JSON code block
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e2) {
                // context-specific error handling later
            }
        }

        // 3. Try to find first { and last }
        const firstOpen = response.indexOf('{');
        const lastClose = response.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            try {
                return JSON.parse(response.substring(firstOpen, lastClose + 1));
            } catch (e3) {
                // fall through
            }
        }

        throw new Error('Failed to parse JSON from AI response');
    }
};

const interpolate = (template, data) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
};

/**
 * Default OpenAI completion (direct client-side call)
 * @private
 */
const defaultOpenAICompletion = async (systemPrompt, userPrompt) => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        throw new Error('OpenAI API Key not configured. Please go to Settings.');
    }

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API Error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
};

/**
 * Generate AI completion using the registered provider.
 * 
 * If a custom provider is registered, it's called first.
 * If the provider returns null/undefined, falls back to default OpenAI.
 * 
 * @param {string} systemPrompt - System message for context
 * @param {string} userPrompt - User's prompt
 * @returns {Promise<string>} AI generated response
 */
export const generateCompletion = async (systemPrompt, userPrompt, options = {}) => {
    try {
        // Try custom provider first (if registered)
        if (customProvider) {
            const result = await customProvider.generateCompletion(systemPrompt, userPrompt, options);
            if (result !== null && result !== undefined) {
                return result;
            }
            // If provider returns null, fall back to default
        }

        // Default: Direct OpenAI
        return await defaultOpenAICompletion(systemPrompt, userPrompt);
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};

/**
 * Generates Google Ads copy based on Campaign, Ad Group, and Site Context
 * @param {Object} campaign - Campaign details
 * @param {Object} adGroup - Ad Group details
 * @param {Object} site - Site configuration (optional)
 * @param {Array} keywords - List of keywords in the Ad Group
 */
export const generateAdCopy = async (campaign, adGroup, site, keywords) => {
    let systemPrompt = `You are a world-class Google Ads copywriter. Create high-performing, relevance-optimized text ads.
Output format should be JSON with fields: 'Headline 1', 'Headline 2', 'Headline 3', 'Description 1', 'Description 2'.
Constraints:
- Headlines: Max 30 chars
- Descriptions: Max 90 chars
- Tone: Professional, persuasive, action-oriented.`;

    if (site) {
        systemPrompt += `\n\nGlobal Site Context:
Name: ${site.name}
URL: ${site.url}
Description: ${site.description || 'N/A'}
SEO Keywords: ${site.seoKeywords || 'N/A'}`;
    }

    const keywordList = keywords.map(k => k.Keyword).join(', ');
    const userPrompt = `Generate a text ad for:
Campaign: ${campaign.Campaign}
Ad Group: ${adGroup['Ad Group']}
Keywords: ${keywordList}

Focus on the unique value proposition derived from the Site Context if available.`;

    return generateCompletion(systemPrompt, userPrompt);
};

/**
 * Generic Generation from a Store Prompt Template
 * @param {Object} promptTemplate - The prompt object from store
 * @param {Object} contextData - Key-value pairs for placeholders
 */
export const generateFromPrompt = async (promptTemplate, contextData, options = {}) => {
    if (!promptTemplate || !promptTemplate.template) {
        throw new Error('Invalid prompt template');
    }

    const content = interpolate(promptTemplate.template, contextData);

    return generateCompletion("You are a helpful AI assistant for Google Ads.", content, options);
};

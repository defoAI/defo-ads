// File: src/schemas/adsSchemas.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

import { z } from 'zod';

/**
 * Zod Schema for a Google Ads Campaign row (simplified for MVP)
 */
export const CampaignSchema = z.object({
    campaign: z.string().min(1, "Campaign name is required"),
    budget: z.number().positive("Budget must be positive"),
    type: z.enum(['Search', 'Display', 'Video', 'Shopping', 'Discovery', 'Performance Max']).default('Search'),
    status: z.enum(['Enabled', 'Paused', 'Removed']).default('Paused'),
    networks: z.string().optional(),
    languages: z.string().default('en'),
    siteId: z.string().optional(), // Link to a Site configuration
});

/**
 * Zod Schema for a Global Site Configuration
 * Used for AI generation context
 */
export const SiteSchema = z.object({
    id: z.string().optional(), // Auto-generated
    name: z.string().min(1, "Site name is required"),
    url: z.string().url("Must be a valid URL"),
    description: z.string().max(500, "Description max 500 chars").optional(),
    seoKeywords: z.string().optional(), // Comma-separated
    siteLinks: z.string().optional(), // JSON string or simple text for now
});

/**
 * Zod Schema for AI Prompt Templates
 */
export const PromptSchema = z.object({
    id: z.string(), // slug-like ID e.g., 'campaign_creation'
    name: z.string().min(1),
    description: z.string().optional(),
    template: z.string().min(1, "Template content is required"),
    contextType: z.enum(['campaign', 'ad', 'site', 'keyword']).default('campaign'),
    placeholders: z.array(z.string()).optional(), // List of available placeholders for UI hints
});

/**
 * Zod Schema for an Ad Group row
 */
export const AdGroupSchema = z.object({
    campaign: z.string().min(1),
    adGroup: z.string().min(1, "Ad Group name is required"),
    maxCpc: z.number().optional(),
    type: z.string().default('Standard'),
    status: z.enum(['Enabled', 'Paused', 'Removed']).default('Enabled'),
});

/**
 * Zod Schema for a Keyword
 */
export const KeywordSchema = z.object({
    campaign: z.string().min(1),
    adGroup: z.string().min(1),
    text: z.string().min(1),
    matchType: z.enum(['Broad', 'Phrase', 'Exact']).default('Broad'),
    status: z.enum(['Enabled', 'Paused', 'Removed']).default('Enabled'),
});

/**
 * Zod Schema for a Responsive Search Ad
 * Enforces character limits: Headlines (30), Descriptions (90)
 */
export const AdSchema = z.object({
    campaign: z.string().min(1),
    adGroup: z.string().min(1),
    headline1: z.string().max(30, "Headline 1 max 30 chars"),
    headline2: z.string().max(30, "Headline 2 max 30 chars"),
    headline3: z.string().max(30, "Headline 3 max 30 chars").optional(),
    description1: z.string().max(90, "Description 1 max 90 chars"),
    description2: z.string().max(90, "Description 2 max 90 chars").optional(),
    finalUrl: z.string().url("Must be a valid URL"),
    path1: z.string().max(15).optional(),
    path2: z.string().max(15).optional(),
});

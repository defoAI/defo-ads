// File: src/schemas/adsSchemas.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

import { z } from 'zod';

/**
 * Zod Schema for a Google Ads Campaign row (simplified for MVP)
 */
export const CampaignSchema = z.object({
    'Campaign': z.string().min(1, "Campaign name is required"),
    'Budget': z.number().positive("Budget must be positive"),
    'Campaign Type': z.enum(['Search', 'Display', 'Video', 'Shopping', 'Discovery', 'Performance Max']).default('Search'),
    'Status': z.enum(['Enabled', 'Paused', 'Removed']).default('Paused'),
    'Networks': z.string().optional(),
    'Languages': z.string().default('en'),
    'siteId': z.number().optional(), // Link to a Site configuration
});

/**
 * Zod Schema for a Global Site Configuration
 * Used for AI generation context
 */
export const SiteSchema = z.object({
    id: z.number().optional(), // Auto-generated
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
    'Campaign': z.string().min(1),
    'Ad Group': z.string().min(1, "Ad Group name is required"),
    'Max CPC': z.number().optional(),
    'Ad Group Type': z.string().default('Standard'),
    'Status': z.enum(['Enabled', 'Paused', 'Removed']).default('Enabled'),
});

/**
 * Zod Schema for a Keyword
 */
export const KeywordSchema = z.object({
    'Campaign': z.string().min(1),
    'Ad Group': z.string().min(1),
    'Keyword': z.string().min(1),
    'Criterion Type': z.enum(['Broad', 'Phrase', 'Exact']).default('Broad'),
    'Status': z.enum(['Enabled', 'Paused', 'Removed']).default('Enabled'),
});

/**
 * Zod Schema for a Responsive Search Ad
 * Enforces character limits: Headlines (30), Descriptions (90)
 */
export const AdSchema = z.object({
    'Campaign': z.string().min(1),
    'Ad Group': z.string().min(1),
    'Headline 1': z.string().max(30, "Headline 1 max 30 chars"),
    'Headline 2': z.string().max(30, "Headline 2 max 30 chars"),
    'Headline 3': z.string().max(30, "Headline 3 max 30 chars").optional(),
    'Description 1': z.string().max(90, "Description 1 max 90 chars"),
    'Description 2': z.string().max(90, "Description 2 max 90 chars").optional(),
    'Final URL': z.string().url("Must be a valid URL"),
    'Path 1': z.string().max(15).optional(),
    'Path 2': z.string().max(15).optional(),
});

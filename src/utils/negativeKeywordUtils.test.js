// File: src/utils/negativeKeywordUtils.test.js
import { detectConflicts } from './negativeKeywordUtils';
import { describe, it, expect } from 'vitest'; // Assuming vitest or jest

describe('negativeKeywordUtils', () => {
    describe('detectConflicts', () => {
        const mockCampaigns = [
            { id: 1, Campaign: 'Campaign A' }
        ];
        const mockAdGroups = [
            { id: 101, campaignId: 1, 'Ad Group': 'Ad Group 1' }
        ];

        it('should detect a direct conflict', () => {
            const keywords = [
                { id: 1001, Keyword: 'free shoes', adGroupId: 101 }
            ];
            const lists = [
                { id: 'l1', name: 'Universal', type: 'universal', keywords: ['free'], appliedToCampaignIds: [] }
            ];

            const conflicts = detectConflicts(keywords, lists, mockAdGroups, mockCampaigns);

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0]).toMatchObject({
                positive: 'free shoes',
                negative: 'free',
                campaign: 'Campaign A'
            });
        });

        it('should strictly match substrings (broad match simulation)', () => {
            const keywords = [
                { id: 1001, Keyword: 'luxury shoes', adGroupId: 101 }, // Should NOT match 'free'
                { id: 1002, Keyword: 'buy free shoes', adGroupId: 101 } // Should match 'free'
            ];
            const lists = [
                { id: 'l1', name: 'Universal', type: 'universal', keywords: ['free'], appliedToCampaignIds: [] }
            ];

            const conflicts = detectConflicts(keywords, lists, mockAdGroups, mockCampaigns);

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].positive).toBe('buy free shoes');
        });

        it('should handle empty inputs gracefully', () => {
            const conflicts = detectConflicts([], [], [], []);
            expect(conflicts).toHaveLength(0);
        });

        it('should handle case insensitivity', () => {
            const keywords = [
                { id: 1001, Keyword: 'Free Shoes', adGroupId: 101 }
            ];
            const lists = [
                { id: 'l1', name: 'Universal', type: 'universal', keywords: ['free'], appliedToCampaignIds: [] }
            ];

            const conflicts = detectConflicts(keywords, lists, mockAdGroups, mockCampaigns);
            expect(conflicts).toHaveLength(1);
        });
    });
});

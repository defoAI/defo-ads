// File: src/utils/negativeKeywordUtils.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Utility functions for negative keyword conflict detection.

/**
 * Detects conflicts between positive keywords and negative keyword lists.
 * @param {Array} keywords - List of positive keywords objects { id, Keyword, adGroupId }
 * @param {Array} negativeKeywordLists - List of negative keyword list objects
 * @param {Array} adGroups - List of ad groups (to resolve campaign context)
 * @param {Array} campaigns - List of campaigns (to resolve names)
 * @returns {Array} - List of conflict objects
 */
export const detectConflicts = (keywords, negativeKeywordLists, adGroups, campaigns) => {
    const foundConflicts = [];

    // 1. Flatten all negative keywords for efficient access
    // detailed object: { text, listName, listId, type }
    const allNegatives = negativeKeywordLists.flatMap(list =>
        list.keywords.map(k => ({
            text: k.toLowerCase(),
            listName: list.name,
            listId: list.id,
            type: list.type
        }))
    );

    keywords.forEach(kw => {
        if (!kw.Keyword) return;
        const positiveText = kw.Keyword.toLowerCase();

        // Resolve Context
        const adGroup = adGroups.find(ag => ag.id === kw.adGroupId);
        if (!adGroup) return; // Orphaned keyword or data issue

        const campaign = campaigns.find(c => c.id === adGroup.campaignId);
        const campaignName = campaign ? campaign.Campaign : 'Unknown';
        const campaignId = campaign ? campaign.id : null;

        allNegatives.forEach(neg => {
            // Check if negative keyword applies to this campaign
            // Universal lists (type === 'universal') apply to ALL campaigns
            // Custom lists apply only if campaignId is in appliedToCampaignIds
            // BUT for the "Check" button, maybe we want to show potential conflicts even if not applied yet?
            // "Smart Negative Keyword Manager" -> "Conflict Detector" usually implies "If I applied this, it would block X"
            // OR "It IS blocking X".
            // Let's assume we check ALL lists to show *potential* conflicts, 
            // but maybe flag if it's currently active or not.
            // For now, let's just find ANY overlap regardless of application status, 
            // as this helps user decide if they CAN apply the list.

            // LOGIC:
            // Broad match negative: triggers if the negative term is present in the search query.
            // Since we don't have search queries, we are checking against Positive Keywords.
            // If negative is "cheap", and positive is "cheap shoes", it blocks.
            // If negative is "cheap", and positive is "luxury shoes", it does not block.

            // Simple string inclusion for Broad Match Negative (approximate)
            // Note: Google's actual logic is: if the negative keyword is in the search query.
            // If my positive keyword is "cheap shoes", and user searches "cheap shoes", "cheap" blocks it.
            // So if positive keyword contains negative keyword, it's a conflict.

            if (positiveText.includes(neg.text)) {
                foundConflicts.push({
                    id: `${kw.id}-${neg.listId}-${neg.text}`, // predictable ID
                    positive: kw.Keyword,
                    negative: neg.text,
                    list: neg.listName,
                    campaign: campaignName,
                    adGroup: adGroup['Ad Group'] || adGroup.name
                });
            }
        });
    });

    return foundConflicts;
};

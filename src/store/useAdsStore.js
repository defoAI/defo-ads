// File: src/store/useAdsStore.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)


// Note: We don't need Papa here if we parse in the component, but we are keeping the logic pure state. 
// Actually, standard pattern is to parse in component (UI layer) and pass objects to store.
// So we just need the logic we wrote above.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAdsStore = create(
    persist(
        (set, get) => ({
            // State
            campaigns: [],
            adGroups: [],
            keywords: [],
            ads: [],
            sites: [],
            negativeKeywordLists: [], // { id, name, type: 'universal'|'custom', keywords: [], appliedToCampaignIds: [] }
            prompts: [],

            // UI State
            activeTab: 'campaigns',
            isLoading: false,

            // Settings
            settings: {
                askForCustomInstructions: false,
            },

            // Actions
            setCampaigns: (campaigns) => set({ campaigns }),
            addCampaign: (campaign) => set({ campaigns: [...get().campaigns, { ...campaign, id: campaign.id || crypto.randomUUID() }] }),
            updateCampaign: (id, updated) => {
                set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, ...updated } : c) });
            },

            setSites: (sites) => set({ sites }),
            addSite: (site) => set({ sites: [...get().sites, { ...site, id: site.id || crypto.randomUUID() }] }),
            updateSite: (id, updated) => {
                set({ sites: get().sites.map(s => s.id === id ? { ...s, ...updated } : s) });
            },

            setPrompts: (prompts) => set({ prompts }),
            savePrompt: (prompt) => {
                const existing = get().prompts.find(p => p.id === prompt.id);
                if (existing) {
                    set({ prompts: get().prompts.map(p => p.id === prompt.id ? { ...p, ...prompt } : p) });
                } else {
                    set({ prompts: [...get().prompts, prompt] });
                }
            },
            resetPrompts: () => set({ prompts: get().defaultPrompts() }), // Helper to reset to defaults

            setAdGroups: (adGroups) => set({ adGroups }),
            addAdGroup: (adGroup) => set({ adGroups: [...get().adGroups, { ...adGroup, id: adGroup.id || crypto.randomUUID() }] }),
            setKeywords: (keywords) => set({ keywords }),
            addKeyword: (keyword) => set({ keywords: [...get().keywords, { ...keyword, id: keyword.id || crypto.randomUUID() }] }),
            setAds: (ads) => set({ ads }),

            addAd: (ad) => set({ ads: [...get().ads, { ...ad, id: ad.id || crypto.randomUUID() }] }),

            // Negative Keyword List Actions
            setNegativeKeywordLists: (lists) => set({ negativeKeywordLists: lists }),
            addNegativeKeywordList: (list) => set({ negativeKeywordLists: [...get().negativeKeywordLists, list] }),
            updateNegativeKeywordList: (id, updated) => {
                set({ negativeKeywordLists: get().negativeKeywordLists.map(l => l.id === id ? { ...l, ...updated } : l) });
            },
            deleteNegativeKeywordList: (id) => set({ negativeKeywordLists: get().negativeKeywordLists.filter(l => l.id !== id) }),
            toggleNegativeListApplication: (listId, campaignId) => {
                const list = get().negativeKeywordLists.find(l => l.id === listId);
                if (!list) return;

                let newAppliedIds;
                if (list.appliedToCampaignIds.includes(campaignId)) {
                    newAppliedIds = list.appliedToCampaignIds.filter(id => id !== campaignId);
                } else {
                    newAppliedIds = [...list.appliedToCampaignIds, campaignId];
                }

                get().updateNegativeKeywordList(listId, { appliedToCampaignIds: newAppliedIds });
            },

            setActiveTab: (tab) => set({ activeTab: tab }),

            // Settings Actions
            setSetting: (key, value) => set({ settings: { ...get().settings, [key]: value } }),
            getSetting: (key) => get().settings?.[key],

            // Data Accessors
            getAdGroupsByCampaign: (campaignId) => get().adGroups.filter(ag => ag.campaignId == campaignId),
            getKeywordsByAdGroup: (adGroupId) => get().keywords.filter(kw => kw.adGroupId == adGroupId),
            getAdsByAdGroup: (adGroupId) => get().ads.filter(a => a.adGroupId == adGroupId),

            // Delete Actions
            deleteSites: (ids) => set({ sites: get().sites.filter(s => !ids.includes(s.id)) }),
            deleteCampaigns: (ids) => set({ campaigns: get().campaigns.filter(c => !ids.includes(c.id)) }),
            deleteAdGroups: (ids) => set({ adGroups: get().adGroups.filter(ag => !ids.includes(ag.id)) }),
            deleteKeywords: (ids) => set({ keywords: get().keywords.filter(k => !ids.includes(k.id)) }),
            deleteAds: (ids) => set({ ads: get().ads.filter(a => !ids.includes(a.id)) }),

            // Import Action
            importData: (rows) => {
                const generateId = () => crypto.randomUUID();

                const campaigns = [];
                const adGroups = [];
                const keywords = [];
                const ads = [];

                rows.forEach((row) => {
                    // Skip empty rows
                    if (!row['Campaign'] && !row['Campaign Status']) return;

                    // Normalize Status (Google Ads Editor uses 'Campaign Status', 'Ad Group Status', 'Status')
                    // We want a unified 'Status' field for our grid
                    if (row['Campaign Status']) row['Status'] = row['Campaign Status'];
                    if (row['Ad Group Status']) row['Status'] = row['Ad Group Status'];

                    // 1. Ads (Responsive search ad, etc.)
                    if (row['Ad type'] && row['Headline 1']) {
                        ads.push({ id: generateId(), ...row });
                        return;
                    }

                    // 2. Keywords
                    if (row['Keyword']) {
                        keywords.push({ id: generateId(), ...row });
                        return;
                    }

                    // 3. Ad Groups (Has Ad Group name, but no Keyword/Ad specific fields)
                    if (row['Ad Group'] && !row['Keyword'] && !row['Headline 1']) {
                        // Link to campaignId if possible, but for flat import we just store the name match
                        // in a real app we'd build a map. For now, flat storage is fine as our selectors use strings or we can strict match.
                        // Actually, the selectors use 'campaignId' (int). We should probably try to map names to IDs or change selectors to use names.
                        // Given the Editor CSV format relies on names, switching store to use names for foreign keys might be easier, 
                        // OR we generate IDs for campaigns and map them here.

                        // Let's generate a temporary ID map for this batch
                        adGroups.push({ id: generateId(), ...row });
                        return;
                    }

                    // 4. Campaigns (Has Campaign name, no Ad Group)
                    if (row['Campaign'] && !row['Ad Group']) {
                        campaigns.push({ id: generateId(), ...row });
                        return;
                    }
                });

                // specific fix for relational ID mapping
                // We need to ensure 'campaignId' exists on children if we want the "Context Filtering" to work.
                // The previous simple demo used IDs. The CSV import gives us Names.
                // We can update the store to index campaigns by Name for easier lookup, or add a 'campaignId' to children during import.

                const campaignMap = {};
                campaigns.forEach(c => { campaignMap[c['Campaign']] = c.id; });

                adGroups.forEach(ag => {
                    if (campaignMap[ag['Campaign']]) ag.campaignId = campaignMap[ag['Campaign']];
                });

                // Similarly for Keywords/Ads -> Ad Groups
                // Ad Groups are not unique by name globally, only per campaign. 
                // Key = CampaignName + AdGroupName
                const adGroupMap = {};
                adGroups.forEach(ag => {
                    adGroupMap[`${ag['Campaign']}|${ag['Ad Group']}`] = ag.id;
                });

                keywords.forEach(kw => {
                    const key = `${kw['Campaign']}|${kw['Ad Group']}`;
                    if (adGroupMap[key]) kw.adGroupId = adGroupMap[key];
                });

                ads.forEach(ad => {
                    const key = `${ad['Campaign']}|${ad['Ad Group']}`;
                    if (adGroupMap[key]) ad.adGroupId = adGroupMap[key];
                });

                console.log(`Imported: ${campaigns.length} campaigns, ${adGroups.length} ad groups, ${keywords.length} keywords, ${ads.length} ads`);
                set({ campaigns, adGroups, keywords, ads });

                return {
                    campaigns: campaigns.length,
                    adGroups: adGroups.length,
                    keywords: keywords.length,
                    ads: ads.length
                };
            },

            reset: () => set({ campaigns: [], adGroups: [], keywords: [], ads: [], sites: [] }),

            // Default Prompts Helper (not state, just a getter)
            defaultPrompts: () => [
                {
                    id: 'campaign_creation',
                    name: 'Campaign Creation',
                    description: 'Generates campaign structure from a user goal',
                    contextType: 'campaign',
                    placeholders: ['{{user_goal}}', '{{site_context}}', '{{user_instructions}}'],
                    template: `You are a Google Ads expert.
User Goal: {{user_goal}}

{{site_context}}

Create a JSON object for a new Campaign with the following fields:
- "Campaign": Name of the campaign
- "Budget": Daily budget in EUR (number)
- "Type": "Search" or "Display"
- "Status": "Paused"
- "Networks": "Google search;Search Partners"
- "Languages": "en"

- "Languages": "en"

Evaluate the goal and suggest a reasonable budget and settings.

{{user_instructions}}`
                },
                {
                    id: 'site_analysis',
                    name: 'Site Analysis',
                    description: 'Analyzes a URL to generate site description and keywords',
                    contextType: 'site',
                    placeholders: ['{{url}}', '{{user_instructions}}'],
                    template: `Analyze the following website URL to create a marketing profile for Google Ads.
URL: {{url}}

Return a JSON object with:
- "name": A short, professional name for the site
- "name": A short, professional name for the site
- "description": A 2-sentence marketing description
- "seoKeywords": A comma-separated list of 10 high-relevance SEO keywords

{{user_instructions}}`
                },
                {
                    id: 'ad_copy_generation',
                    name: 'Ad Copy Generation',
                    description: 'Generates text ads for an ad group',
                    contextType: 'ad',
                    placeholders: ['{{campaign_name}}', '{{ad_group_name}}', '{{keywords}}', '{{site_context}}', '{{user_instructions}}'],
                    template: `You are a world-class Google Ads copywriter. Create high-performing, relevance-optimized text ads.
Context:
Campaign: {{campaign_name}}
Ad Group: {{ad_group_name}}
Keywords: {{keywords}}

{{site_context}}

Output format should be JSON with fields: 'Headline 1', 'Headline 2', 'Headline 3', 'Description 1', 'Description 2'.
Constraints:
- Headlines: Max 30 chars
- Descriptions: Max 90 chars
- Tone: Professional, persuasive, action-oriented.

{{user_instructions}}`
                }
            ],
        }),
        {
            name: 'defo-ads-storage', // unique name
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Ensure default prompts exist if storage was empty or missing them
                if (state && (!state.prompts || state.prompts.length === 0)) {
                    state.setPrompts(state.defaultPrompts());
                }
                // Ensure default negative lists exist
                if (state && (!state.negativeKeywordLists || state.negativeKeywordLists.length === 0)) {
                    // Initialize with some universal lists
                    state.setNegativeKeywordLists([
                        {
                            id: 'univ_1',
                            name: 'Universal - Job Seekers',
                            type: 'universal',
                            keywords: ['job', 'career', 'resume', 'hiring', 'internship', 'salary', 'recruiter'],
                            appliedToCampaignIds: []
                        },
                        {
                            id: 'univ_2',
                            name: 'Universal - Cheapskates',
                            type: 'universal',
                            keywords: ['free', 'cheap', 'torrent', 'crack', 'hack', 'download free', 'serial key'],
                            appliedToCampaignIds: []
                        }
                    ]);
                }
            }
        }

    )
);


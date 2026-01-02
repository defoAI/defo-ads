// File: src/store/useAdsStore.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)


// Note: We don't need Papa here if we parse in the component, but we are keeping the logic pure state. 
// Actually, standard pattern is to parse in component (UI layer) and pass objects to store.
// So we just need the logic we wrote above.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getDataProvider, isCloudStorage } from '../services/dataService';

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
                useServerAI: true,
            },

            // Actions
            // Actions
            sync: async () => {
                if (isCloudStorage()) {
                    set({ isLoading: true });
                    try {
                        const provider = getDataProvider();
                        const [campaigns, adGroups, keywords, ads, sites] = await Promise.all([
                            provider.getCampaigns(),
                            provider.getAdGroups(),
                            provider.getKeywords(),
                            provider.getAds(),
                            provider.getSites()
                        ]);
                        set({ campaigns, adGroups, keywords, ads, sites, isLoading: false });
                    } catch (error) {
                        console.error('Sync failed:', error);
                        set({ isLoading: false });
                    }
                }
            },

            setCampaigns: (campaigns) => set({ campaigns }),
            addCampaign: async (campaign) => {
                const now = new Date().toISOString();
                const newCampaign = {
                    ...campaign,
                    id: campaign.id || crypto.randomUUID(),
                    createdAt: campaign.createdAt || now,
                    updatedAt: now
                };
                // Optimistic Update
                set({ campaigns: [...get().campaigns, newCampaign] });

                if (isCloudStorage()) {
                    try {
                        const saved = await getDataProvider().saveCampaign(newCampaign);
                        // Update with server version (e.g. real ID)
                        set({ campaigns: get().campaigns.map(c => c.id === newCampaign.id ? saved : c) });
                    } catch (e) {
                        console.error("Failed to save campaign", e);
                        // Rollback? For now just log.
                    }
                }
            },
            updateCampaign: async (id, updated) => {
                // Optimistic
                const now = new Date().toISOString();
                set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, ...updated, updatedAt: now } : c) });

                if (isCloudStorage()) {
                    const campaign = get().campaigns.find(c => c.id === id);
                    if (campaign) await getDataProvider().saveCampaign(campaign);
                }
            },

            setSites: (sites) => set({ sites }),
            addSite: async (site) => {
                const now = new Date().toISOString();
                const newSite = {
                    ...site,
                    id: site.id || crypto.randomUUID(),
                    createdAt: site.createdAt || now,
                    updatedAt: now
                };
                set({ sites: [...get().sites, newSite] });
                if (isCloudStorage()) {
                    const saved = await getDataProvider().saveSite(newSite);
                    set({ sites: get().sites.map(s => s.id === newSite.id ? saved : s) });
                }
            },
            updateSite: async (id, updated) => {
                const now = new Date().toISOString();
                set({ sites: get().sites.map(s => s.id === id ? { ...s, ...updated, updatedAt: now } : s) });
                if (isCloudStorage()) {
                    const site = get().sites.find(s => s.id === id);
                    if (site) await getDataProvider().saveSite(site);
                }
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
            addAdGroup: async (adGroup) => {
                const now = new Date().toISOString();
                const newGroup = {
                    ...adGroup,
                    id: adGroup.id || crypto.randomUUID(),
                    createdAt: adGroup.createdAt || now,
                    updatedAt: now
                };
                set({ adGroups: [...get().adGroups, newGroup] });
                if (isCloudStorage()) {
                    const saved = await getDataProvider().saveAdGroup(newGroup);
                    set({ adGroups: get().adGroups.map(x => x.id === newGroup.id ? saved : x) });
                }
            },
            updateAdGroup: async (id, updated) => {
                const now = new Date().toISOString();
                set({ adGroups: get().adGroups.map(x => x.id === id ? { ...x, ...updated, updatedAt: now } : x) });
                if (isCloudStorage()) {
                    const item = get().adGroups.find(x => x.id === id);
                    if (item) await getDataProvider().saveAdGroup(item);
                }
            },

            setKeywords: (keywords) => set({ keywords }),
            addKeyword: async (keyword) => {
                const now = new Date().toISOString();
                const newKw = {
                    ...keyword,
                    id: keyword.id || crypto.randomUUID(),
                    createdAt: keyword.createdAt || now,
                    updatedAt: now
                };
                set({ keywords: [...get().keywords, newKw] });
                if (isCloudStorage()) {
                    const saved = await getDataProvider().saveKeyword(newKw);
                    set({ keywords: get().keywords.map(x => x.id === newKw.id ? saved : x) });
                }
            },
            updateKeyword: async (id, updated) => {
                const now = new Date().toISOString();
                set({ keywords: get().keywords.map(x => x.id === id ? { ...x, ...updated, updatedAt: now } : x) });
                if (isCloudStorage()) {
                    const item = get().keywords.find(x => x.id === id);
                    if (item) await getDataProvider().saveKeyword(item);
                }
            },

            setAds: (ads) => set({ ads }),
            addAd: async (ad) => {
                const now = new Date().toISOString();
                const newAd = {
                    ...ad,
                    id: ad.id || crypto.randomUUID(),
                    createdAt: ad.createdAt || now,
                    updatedAt: now
                };
                set({ ads: [...get().ads, newAd] });
                if (isCloudStorage()) {
                    const saved = await getDataProvider().saveAd(newAd);
                    set({ ads: get().ads.map(x => x.id === newAd.id ? saved : x) });
                }
            },
            updateAd: async (id, updated) => {
                const now = new Date().toISOString();
                set({ ads: get().ads.map(x => x.id === id ? { ...x, ...updated, updatedAt: now } : x) });
                if (isCloudStorage()) {
                    const item = get().ads.find(x => x.id === id);
                    if (item) await getDataProvider().saveAd(item);
                }
            },

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
            // Delete Actions
            deleteSites: async (ids) => {
                set({ sites: get().sites.filter(s => !ids.includes(s.id)) });
                if (isCloudStorage()) await getDataProvider().deleteSites(ids);
            },
            deleteCampaigns: async (ids) => {
                set({ campaigns: get().campaigns.filter(c => !ids.includes(c.id)) });
                if (isCloudStorage()) await getDataProvider().deleteCampaigns(ids);
            },
            deleteAdGroups: async (ids) => {
                set({ adGroups: get().adGroups.filter(ag => !ids.includes(ag.id)) });
                if (isCloudStorage()) await getDataProvider().deleteAdGroups(ids);
            },
            deleteKeywords: async (ids) => {
                set({ keywords: get().keywords.filter(k => !ids.includes(k.id)) });
                if (isCloudStorage()) await getDataProvider().deleteKeywords(ids);
            },
            deleteAds: async (ids) => {
                set({ ads: get().ads.filter(a => !ids.includes(a.id)) });
                if (isCloudStorage()) await getDataProvider().deleteAds(ids);
            },

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


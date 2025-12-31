// File: src/views/AdDetailView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Ad Detail View with tabs for Edit, Preview, Sitelinks, and Translate.
// Beautiful design with icons and consistent styling.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Chip,
    Alert,
    LinearProgress,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Save as SaveIcon,
    Visibility as PreviewIcon,
    Translate as TranslateIcon,
    Edit as EditIcon,
    CheckCircle as EnabledIcon,
    PauseCircle as PausedIcon,
    Link as SitelinkIcon,
    OpenInNew as OpenIcon,
    Article as AdIcon,
    NavigateNext as NavigateNextIcon,
    RateReview as ReviewIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { generateFromPrompt, parseAiResponse } from '../services/aiService';
import { trackPageView, trackAdUpdated, trackAdTranslation, trackSitelinksGenerated, trackAiAssistClick, trackAiGenerationSuccess, trackAiGenerationError } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

// Tab Components
import AdEditTab from './AdDetail/AdEditTab';
import AdPreviewTab from './AdDetail/AdPreviewTab';
import AdSitelinksTab from './AdDetail/AdSitelinksTab';
import AdLandingPagesTab from './AdDetail/AdLandingPagesTab';
import AdReviewTab from './AdDetail/AdReviewTab';
import AdTranslateTab from './AdDetail/AdTranslateTab';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const AdDetailView = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { ads, setAds, sites } = useAdsStore();

    const languages = [
        { code: 'de', name: t('languages.de') },
        { code: 'fr', name: t('languages.fr') },
        { code: 'es', name: t('languages.es') },
        { code: 'it', name: t('languages.it') },
        { code: 'pt', name: t('languages.pt') },
        { code: 'nl', name: t('languages.nl') },
        { code: 'pl', name: t('languages.pl') },
        { code: 'ja', name: t('languages.ja') },
        { code: 'zh', name: t('languages.zh') },
        { code: 'ko', name: t('languages.ko') },
    ];

    const [activeTab, setActiveTab] = useState(0);
    const [adData, setAdData] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('de');
    const [translatedAd, setTranslatedAd] = useState(null);

    // Sitelinks state
    const [sitelinks, setSitelinks] = useState([]);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [isGeneratingSitelinks, setIsGeneratingSitelinks] = useState(false);

    // Landing pages state
    const [landingPages, setLandingPages] = useState([]);
    const [isGeneratingLandingPages, setIsGeneratingLandingPages] = useState(false);

    // Ad Review state
    const [adReview, setAdReview] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isApplyingImprovement, setIsApplyingImprovement] = useState(null);

    useEffect(() => {
        const ad = ads.find(a => a.id === parseInt(id));
        if (ad) {
            setAdData({ ...ad });
            if (ad.sitelinks) {
                try {
                    setSitelinks(typeof ad.sitelinks === 'string' ? JSON.parse(ad.sitelinks) : ad.sitelinks);
                } catch {
                    setSitelinks([]);
                }
            }
            if (ad.landingPageUrls) {
                try {
                    setLandingPages(typeof ad.landingPageUrls === 'string' ? JSON.parse(ad.landingPageUrls) : ad.landingPageUrls);
                } catch {
                    setLandingPages([]);
                }
            }
        }
        // Track page view
        trackPageView('ad_detail');
    }, [id, ads]);

    if (!adData) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>{t('ad_detail.not_found')}</Typography>
                <Button variant="contained" onClick={() => navigate('/ads')}>{t('navigation.back_to_ads')}</Button>
            </Box>
        );
    }

    const handleFieldChange = (field, value) => {
        setAdData(prev => ({ ...prev, [field]: value }));
        if (success) setSuccess(null);
    };

    const handleSave = () => {
        const updatedAd = { ...adData, sitelinks: sitelinks, landingPageUrls: landingPages };
        const updatedAds = ads.map(a => a.id === adData.id ? updatedAd : a);
        setAds(updatedAds);
        trackAdUpdated();
        setSuccess(t('ad_detail.messages.saved'));
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleTranslate = async (instructions) => {
        setIsTranslating(true);
        setError(null);
        trackAiAssistClick('ad_translation');
        const startTime = Date.now();

        try {
            const targetLang = languages.find(l => l.code === targetLanguage);

            const translatePrompt = {
                template: `Translate the following Google Ad copy to ${targetLang?.name || targetLanguage}.
Maintain the same character limits and persuasive tone.

Original Ad:
Headline 1: ${adData['Headline 1'] || ''}
Headline 2: ${adData['Headline 2'] || ''}
Headline 3: ${adData['Headline 3'] || ''}
Description 1: ${adData['Description 1'] || ''}
Description 2: ${adData['Description 2'] || ''}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Return a JSON object with translated fields:
- "Headline 1": (max 30 chars)
- "Headline 2": (max 30 chars)
- "Headline 3": (max 30 chars)
- "Description 1": (max 90 chars)
- "Description 2": (max 90 chars)`
            };

            const result = await generateFromPrompt(translatePrompt, {});
            const data = parseAiResponse(result);
            setTranslatedAd(data);
            trackAiGenerationSuccess('ad_translation', Date.now() - startTime);

        } catch (err) {
            console.error(err);
            setError(t('ad_detail.messages.translation_failed'));
            trackAiGenerationError('ad_translation', err.message);
        } finally {
            setIsTranslating(false);
        }
    };

    const applyTranslation = () => {
        if (translatedAd) {
            setAdData(prev => ({
                ...prev,
                'Headline 1': translatedAd['Headline 1'] || prev['Headline 1'],
                'Headline 2': translatedAd['Headline 2'] || prev['Headline 2'],
                'Headline 3': translatedAd['Headline 3'] || prev['Headline 3'],
                'Description 1': translatedAd['Description 1'] || prev['Description 1'],
                'Description 2': translatedAd['Description 2'] || prev['Description 2'],
            }));
            setTranslatedAd(null);
            setActiveTab(0);
            trackAdTranslation(targetLanguage);
            setSuccess(t('ad_detail.messages.translation_applied'));
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    // Sitelinks handlers
    const handleAddSitelink = () => {
        setSitelinks([...sitelinks, { text: '', url: '', description1: '', description2: '' }]);
    };

    const handleRemoveSitelink = (index) => {
        setSitelinks(sitelinks.filter((_, i) => i !== index));
    };

    const handleSitelinkChange = (index, field, value) => {
        const updated = [...sitelinks];
        updated[index] = { ...updated[index], [field]: value };
        setSitelinks(updated);
    };

    const handleLoadFromSite = () => {
        if (selectedSiteId) {
            const site = sites.find(s => s.id === parseInt(selectedSiteId));
            if (site && site.siteLinks) {
                try {
                    const parsed = typeof site.siteLinks === 'string' ? JSON.parse(site.siteLinks) : site.siteLinks;
                    setSitelinks(Array.isArray(parsed) ? parsed : []);
                    setSuccess(t('ad_detail.messages.sitelinks_loaded'));
                    setTimeout(() => setSuccess(null), 3000);
                } catch {
                    setError(t('ad_detail.messages.sitelinks_failed'));
                }
            } else {
                setError(t('ad_detail.messages.sitelinks_failed'));
            }
        }
    };

    const handleGenerateSitelinks = async (instructions) => {
        setIsGeneratingSitelinks(true);
        setError(null);
        trackAiAssistClick('sitelink_generation');
        const startTime = Date.now();

        try {
            let siteContext = '';
            if (selectedSiteId) {
                const site = sites.find(s => s.id === parseInt(selectedSiteId));
                if (site) {
                    siteContext = `Site: ${site.name}\nURL: ${site.url}\nDescription: ${site.description || ''}\nKeywords: ${site.seoKeywords || ''}`;
                }
            }

            const sitelinkPrompt = {
                template: `Generate 4 Google Ads sitelinks for the following ad.

Ad Headlines: ${adData['Headline 1']} | ${adData['Headline 2']} | ${adData['Headline 3']}
Ad Descriptions: ${adData['Description 1']} ${adData['Description 2']}

${siteContext ? `Site Context:\n${siteContext}` : ''}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Return a JSON array of 4 sitelinks, each with:
- "text": Link text (max 25 chars)
- "url": Target URL path (e.g., "/products", "/about")
- "description1": First description line (max 35 chars)
- "description2": Second description line (max 35 chars)`
            };

            const result = await generateFromPrompt(sitelinkPrompt, {});
            const data = parseAiResponse(result);

            if (Array.isArray(data)) {
                setSitelinks(data);
                trackSitelinksGenerated(true);
                trackAiGenerationSuccess('sitelink_generation', Date.now() - startTime);
                setSuccess(t('ad_detail.messages.sitelinks_generated'));
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (err) {
            console.error(err);
            setError(t('ad_detail.messages.sitelinks_failed'));
            trackAiGenerationError('sitelink_generation', err.message);
        } finally {
            setIsGeneratingSitelinks(false);
        }
    };

    // Landing pages handlers
    const handleAddLandingPage = () => {
        setLandingPages([...landingPages, { url: '', label: '' }]);
    };

    const handleRemoveLandingPage = (index) => {
        setLandingPages(landingPages.filter((_, i) => i !== index));
    };

    const handleLandingPageChange = (index, field, value) => {
        const updated = [...landingPages];
        updated[index] = { ...updated[index], [field]: value };
        setLandingPages(updated);
    };

    const handleGenerateLandingPages = async (instructions) => {
        setIsGeneratingLandingPages(true);
        setError(null);
        trackAiAssistClick('landing_page_generation');
        const startTime = Date.now();

        try {
            let siteContext = '';
            if (selectedSiteId) {
                const site = sites.find(s => s.id === parseInt(selectedSiteId));
                if (site) {
                    siteContext = `Site: ${site.name}\nURL: ${site.url}\nDescription: ${site.description || ''}\nKeywords: ${site.seoKeywords || ''}`;
                }
            }

            const landingPagePrompt = {
                template: `Generate 4-6 suggested landing page URLs for the following Google Ad.

Ad Headlines: ${adData['Headline 1']} | ${adData['Headline 2']} | ${adData['Headline 3']}
Ad Descriptions: ${adData['Description 1']} ${adData['Description 2']}
Current Final URL: ${adData['Final URL'] || 'Not set'}

${siteContext ? `Site Context:\n${siteContext}` : ''}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Return a JSON array of landing pages, each with:
- "url": Full landing page URL (use the site domain if available, otherwise suggest paths)
- "label": Brief description of the page (e.g., "Product Page", "Pricing", "Free Trial")`
            };

            const result = await generateFromPrompt(landingPagePrompt, {});
            const data = parseAiResponse(result);

            if (Array.isArray(data)) {
                setLandingPages(data);
                trackAiGenerationSuccess('landing_page_generation', Date.now() - startTime);
                setSuccess(t('ad_detail.messages.landing_pages_generated'));
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (err) {
            console.error(err);
            setError(t('ad_detail.messages.landing_pages_failed'));
            trackAiGenerationError('landing_page_generation', err.message);
        } finally {
            setIsGeneratingLandingPages(false);
        }
    };

    // Ad Review handlers
    const handleReviewAd = async () => {
        setIsReviewing(true);
        setError(null);
        trackAiAssistClick('ad_review');
        const startTime = Date.now();

        try {
            const reviewPrompt = {
                template: `You are an expert Google Ads copywriter and analyst. Review this ad and provide detailed feedback.

Ad Headlines:
- Headline 1: ${adData['Headline 1'] || '(empty)'}
- Headline 2: ${adData['Headline 2'] || '(empty)'}
- Headline 3: ${adData['Headline 3'] || '(empty)'}

Ad Descriptions:
- Description 1: ${adData['Description 1'] || '(empty)'}
- Description 2: ${adData['Description 2'] || '(empty)'}

Final URL: ${adData['Final URL'] || '(not set)'}

Provide a comprehensive review with ratings and specific improvement suggestions.

Return a JSON object with:
{
  "overallScore": <number 1-10>,
  "categories": [
    {
      "name": "Relevance & Clarity",
      "score": <number 1-10>,
      "feedback": "<brief feedback>",
      "improvement": "<specific improvement suggestion>"
    },
    {
      "name": "Call to Action",
      "score": <number 1-10>,
      "feedback": "<brief feedback>",
      "improvement": "<specific improvement suggestion>"
    },
    {
      "name": "Emotional Appeal",
      "score": <number 1-10>,
      "feedback": "<brief feedback>",
      "improvement": "<specific improvement suggestion>"
    },
    {
      "name": "Keyword Usage",
      "score": <number 1-10>,
      "feedback": "<brief feedback>",
      "improvement": "<specific improvement suggestion>"
    },
    {
      "name": "Character Optimization",
      "score": <number 1-10>,
      "feedback": "<brief feedback>",
      "improvement": "<specific improvement suggestion>"
    }
  ],
  "topSuggestion": "<the single most impactful improvement to make>"
}`
            };

            const result = await generateFromPrompt(reviewPrompt, {});
            const data = parseAiResponse(result);
            setAdReview(data);
            trackAiGenerationSuccess('ad_review', Date.now() - startTime);

        } catch (err) {
            console.error(err);
            setError(t('ad_detail.messages.review_failed'));
            trackAiGenerationError('ad_review', err.message);
        } finally {
            setIsReviewing(false);
        }
    };

    const handleApplyImprovement = async (category) => {
        setIsApplyingImprovement(category.name);
        setError(null);
        const startTime = Date.now();

        try {
            const improvePrompt = {
                template: `You are an expert Google Ads copywriter. Improve this ad based on the following suggestion.

Current Ad:
- Headline 1: ${adData['Headline 1'] || ''}
- Headline 2: ${adData['Headline 2'] || ''}
- Headline 3: ${adData['Headline 3'] || ''}
- Description 1: ${adData['Description 1'] || ''}
- Description 2: ${adData['Description 2'] || ''}

Category to improve: ${category.name}
Specific improvement needed: ${category.improvement}

Rewrite the ad copy with this improvement. Maintain Google Ads character limits:
- Headlines: max 30 characters each
- Descriptions: max 90 characters each

Return a JSON object:
{
  "Headline 1": "<improved headline, max 30 chars>",
  "Headline 2": "<improved headline, max 30 chars>",
  "Headline 3": "<improved headline, max 30 chars>",
  "Description 1": "<improved description, max 90 chars>",
  "Description 2": "<improved description, max 90 chars>"
}`
            };

            const result = await generateFromPrompt(improvePrompt, {});
            const data = parseAiResponse(result);

            // Apply the improvements
            setAdData(prev => ({
                ...prev,
                'Headline 1': data['Headline 1'] || prev['Headline 1'],
                'Headline 2': data['Headline 2'] || prev['Headline 2'],
                'Headline 3': data['Headline 3'] || prev['Headline 3'],
                'Description 1': data['Description 1'] || prev['Description 1'],
                'Description 2': data['Description 2'] || prev['Description 2'],
            }));

            // Clear the review since the ad has changed
            setAdReview(null);
            trackAiGenerationSuccess('ad_improvement', Date.now() - startTime);
            setSuccess(t('ad_detail.messages.improvement_applied', { category: category.name }));
            setTimeout(() => setSuccess(null), 4000);
            setActiveTab(0); // Switch to Edit tab

        } catch (err) {
            console.error(err);
            setError(t('ad_detail.messages.improvement_failed'));
            trackAiGenerationError('ad_improvement', err.message);
        } finally {
            setIsApplyingImprovement(null);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
            {/* Navigation & Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/ads')}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    {t('navigation.back_to_list')}
                </Button>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" onClick={() => navigate('/ads')} sx={{ cursor: 'pointer' }}>
                        {t('nav.ads')}
                    </Link>
                    <Typography color="text.primary">{adData['Headline 1'] || `Ad #${adData.id}`}</Typography>
                </Breadcrumbs>
            </Box>

            <Paper sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                {(isTranslating || isGeneratingSitelinks || isGeneratingLandingPages) && (
                    <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                )}

                {/* Header */}
                <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: { xs: 2, sm: 0 },
                        mb: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AdIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {adData['Headline 1'] || `Ad #${adData.id}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {adData['Ad Group']} • {adData.Campaign}
                                </Typography>
                            </Box>
                            <Chip
                                icon={adData.Status === 'Enabled' ? <EnabledIcon /> : <PausedIcon />}
                                label={adData.Status || 'Paused'}
                                color={adData.Status === 'Enabled' ? 'success' : 'default'}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            size="large"
                            sx={{ px: 4, mt: { xs: 2, sm: 0 } }}
                            fullWidth={false}
                        >
                            {t('ad_detail.save_changes')}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab icon={<EditIcon />} iconPosition="start" label={t('tabs.edit')} />
                        <Tab icon={<PreviewIcon />} iconPosition="start" label={t('tabs.preview')} />
                        <Tab icon={<SitelinkIcon />} iconPosition="start" label={t('tabs.sitelinks')} />
                        <Tab icon={<OpenIcon />} iconPosition="start" label={t('tabs.landing_pages')} />
                        <Tab icon={<ReviewIcon />} iconPosition="start" label={t('tabs.ad_review')} />
                        <Tab icon={<TranslateIcon />} iconPosition="start" label={t('tabs.translate')} />
                    </Tabs>
                </Box>

                {/* Edit Tab */}
                <TabPanel value={activeTab} index={0}>
                    <AdEditTab
                        adData={adData}
                        handleFieldChange={handleFieldChange}
                    />
                </TabPanel>

                {/* Preview Tab */}
                <TabPanel value={activeTab} index={1}>
                    <AdPreviewTab
                        adData={adData}
                        sitelinks={sitelinks}
                    />
                </TabPanel>

                {/* Sitelinks Tab */}
                <TabPanel value={activeTab} index={2}>
                    <AdSitelinksTab
                        sitelinks={sitelinks}
                        onAdd={handleAddSitelink}
                        onRemove={handleRemoveSitelink}
                        onChange={handleSitelinkChange}
                        onLoadFromSite={handleLoadFromSite}
                        selectedSiteId={selectedSiteId}
                        onSelectedSiteChange={setSelectedSiteId}
                        sites={sites}
                        onGenerate={handleGenerateSitelinks}
                        isGenerating={isGeneratingSitelinks}
                    />
                </TabPanel>

                {/* Landing Pages Tab */}
                <TabPanel value={activeTab} index={3}>
                    <AdLandingPagesTab
                        landingPages={landingPages}
                        onAdd={handleAddLandingPage}
                        onRemove={handleRemoveLandingPage}
                        onChange={handleLandingPageChange}
                        onGenerate={handleGenerateLandingPages}
                        isGenerating={isGeneratingLandingPages}
                    />
                </TabPanel>

                {/* Ad Review Tab */}
                <TabPanel value={activeTab} index={4}>
                    <AdReviewTab
                        isReviewing={isReviewing}
                        onReview={handleReviewAd}
                        adReview={adReview}
                        isApplyingImprovement={isApplyingImprovement}
                        onApplyImprovement={handleApplyImprovement}
                    />
                </TabPanel>

                {/* Translate Tab */}
                <TabPanel value={activeTab} index={5}>
                    <AdTranslateTab
                        targetLanguage={targetLanguage}
                        onTargetLanguageChange={setTargetLanguage}
                        languages={languages}
                        onTranslate={handleTranslate}
                        isTranslating={isTranslating}
                        translatedAd={translatedAd}
                        onApply={applyTranslation}
                    />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default AdDetailView;

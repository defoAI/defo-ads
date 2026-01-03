// File: src/components/CreateCampaignDialog.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Modern, user-friendly dialog for creating a new campaign.
// Now requires site selection, campaign goals, language, and generates complete campaigns.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {

    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    Avatar,
    Fade,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Slider,
    Chip,
    FormControl,
    InputLabel,
    Select,
    Stepper,
    Step,
    StepLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    LinearProgress,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    RocketLaunch as CreateIcon,
    Search as SearchIcon,
    DisplaySettings as DisplayIcon,
    VideoLibrary as VideoIcon,
    ShoppingCart as ShoppingIcon,
    Explore as DiscoveryIcon,
    Speed as PMaxIcon,
    PlayArrow as EnabledIcon,
    Pause as PausedIcon,
    AutoAwesome as AiIcon,
    Language as SiteIcon,
    TrendingUp as GoalIcon,
    Add as AddIcon,
    Translate as LanguageIcon,
} from '@mui/icons-material';
import { CampaignSchema } from '../schemas/adsSchemas';
import { useAdsStore } from '../store/useAdsStore';
import { generateFromPrompt, parseAiResponse } from '../services/aiService';
import AiAssistButton from './AiAssistButton';
import { trackCampaignDialogOpen, trackCampaignCreated, trackAiAssistClick, trackAiGenerationSuccess, trackAiGenerationError } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

// Campaign types will be defined inside component to use translations

// Languages will be defined inside component to use translations

const CreateCampaignDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { campaigns, addCampaign, addAdGroup, addKeyword, addAd, sites, prompts, adGroups, keywords, ads } = useAdsStore();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const steps = [t('create_campaign.steps.select_site'), t('create_campaign.steps.campaign_goals'), t('create_campaign.steps.review')];

    const [activeStep, setActiveStep] = useState(0);
    const [siteId, setSiteId] = useState('');
    const [campaignGoal, setCampaignGoal] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [budget, setBudget] = useState(50);
    const [campaignType, setCampaignType] = useState('Search');
    const [status, setStatus] = useState('Paused');
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generation options
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [generateAdGroups, setGenerateAdGroups] = useState(true);
    const [generateKeywords, setGenerateKeywords] = useState(true);
    const [generateAds, setGenerateAds] = useState(true);

    // Generated data
    const [generatedData, setGeneratedData] = useState(null);
    const [generationProgress, setGenerationProgress] = useState('');

    const selectedSite = sites.find(s => s.id === siteId);

    // Track dialog open
    useEffect(() => {
        if (open) {
            trackCampaignDialogOpen();
            // Auto-select site if only one exists (minimal friction)
            if (sites.length === 1 && !siteId) {
                setSiteId(sites[0].id);
            }
        }
    }, [open, sites, siteId]);

    const languages = [
        { code: 'en', name: t('languages.en') },
        { code: 'de', name: t('languages.de') },
        { code: 'fr', name: t('languages.fr') },
        { code: 'es', name: t('languages.es') },
        { code: 'it', name: t('languages.it') },
        { code: 'pt', name: t('languages.pt') },
        { code: 'nl', name: t('languages.nl') },
        { code: 'pl', name: t('languages.pl') },
        { code: 'ja', name: t('languages.ja') },
        { code: 'zh', name: t('languages.zh') },
    ];

    // Campaign type options with icons and descriptions
    const campaignTypes = [
        { value: 'Search', icon: <SearchIcon />, label: t('create_campaign.campaign_types.search'), desc: t('create_campaign.campaign_types_desc.search') },
        { value: 'Display', icon: <DisplayIcon />, label: t('create_campaign.campaign_types.display'), desc: t('create_campaign.campaign_types_desc.display') },
        { value: 'Video', icon: <VideoIcon />, label: t('create_campaign.campaign_types.video'), desc: t('create_campaign.campaign_types_desc.video') },
        { value: 'Shopping', icon: <ShoppingIcon />, label: t('create_campaign.campaign_types.shopping'), desc: t('create_campaign.campaign_types_desc.shopping') },
        { value: 'Performance Max', icon: <PMaxIcon />, label: t('create_campaign.campaign_types.performance_max'), desc: t('create_campaign.campaign_types_desc.performance_max') },
    ];

    const handleAiGeneration = async (instructions) => {
        if (!siteId) {
            setError(t('create_campaign.messages.select_site'));
            return;
        }

        const goal = campaignGoal || instructions;
        if (!goal || !goal.trim()) {
            setError(t('create_campaign.messages.enter_goals'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedData(null);
        trackAiAssistClick('campaign_creation');
        const startTime = Date.now();

        try {
            const selectedLang = languages.find(l => l.code === targetLanguage);
            const langName = selectedLang?.name || 'English';

            // Build site context
            let siteContext = '';
            if (selectedSite) {
                siteContext = `Site: ${selectedSite.name}\nURL: ${selectedSite.url}\nDescription: ${selectedSite.description || ''}\nKeywords: ${selectedSite.seoKeywords || ''}`;
            }

            // Build comprehensive prompt for all entities
            const entitiesToGenerate = [];
            if (generateAdGroups) entitiesToGenerate.push('ad_groups');
            if (generateKeywords) entitiesToGenerate.push('keywords');
            if (generateAds) entitiesToGenerate.push('ads');

            setGenerationProgress(t('create_campaign.campaign_goals.generating_structure'));

            const comprehensivePrompt = {
                template: `Generate a complete Google Ads campaign structure in ${langName}.

Campaign Goal: ${goal}

${siteContext ? `Site Context:\n${siteContext}` : ''}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Please generate:
1. Campaign details (name, type, suggested budget)
${generateAdGroups ? '2. 2-3 Ad Groups with descriptive names' : ''}
${generateKeywords ? '3. 5-10 keywords per ad group (mix of broad, phrase, exact match)' : ''}
${generateAds ? '4. 1-2 responsive search ads per ad group (headlines max 30 chars, descriptions max 90 chars)' : ''}

Return a JSON object with:
{
  "campaign": {
    "name": "campaign name",
    "type": "Search|Display|Video|Shopping|Performance Max",
    "budget": number,
    "language": "${targetLanguage}"
  }${generateAdGroups ? `,
  "adGroups": [
    { "name": "ad group name", "maxCpc": number }
  ]` : ''}${generateKeywords ? `,
  "keywords": [
    { "adGroup": "ad group name", "keyword": "keyword text", "matchType": "Broad|Phrase|Exact" }
  ]` : ''}${generateAds ? `,
  "ads": [
    { 
      "adGroup": "ad group name",
      "headline1": "max 30 chars",
      "headline2": "max 30 chars", 
      "headline3": "max 30 chars",
      "description1": "max 90 chars",
      "description2": "max 90 chars"
    }
  ]` : ''}
}`
            };

            const result = await generateFromPrompt(comprehensivePrompt, {});
            const data = parseAiResponse(result);

            // Store generated data
            setGeneratedData(data);

            // Set campaign fields
            if (data.campaign) {
                if (data.campaign.name) setCampaignName(data.campaign.name);
                if (data.campaign.budget) setBudget(Number(data.campaign.budget));
                if (data.campaign.type && ['Search', 'Display', 'Video', 'Shopping', 'Performance Max'].includes(data.campaign.type)) {
                    setCampaignType(data.campaign.type);
                }
            }

            setGenerationProgress('');
            setActiveStep(2);
            trackAiGenerationSuccess('campaign_creation', Date.now() - startTime);

        } catch (err) {
            console.error(err);
            setError(t('create_campaign.messages.generation_failed'));
            setGenerationProgress('');
            trackAiGenerationError('campaign_creation', err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (activeStep === 0 && !siteId) {
            setError(t('create_campaign.messages.select_site'));
            return;
        }
        if (activeStep === 1 && !campaignGoal.trim()) {
            setError(t('create_campaign.messages.enter_goals'));
            return;
        }
        setError(null);
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!campaignName.trim()) {
            setError(t('create_campaign.messages.enter_name'));
            return;
        }
        if (budget < 1) {
            setError(t('create_campaign.messages.budget_min'));
            return;
        }

        setError(null);
        setIsGenerating(true); // Reuse loading state to prevent double submit

        try {
            // Generate campaign ID
            const maxCampaignId = campaigns.reduce((max, c) => Math.max(max, c.id || 0), 0);

            // Note: We use standard keys for API
            const newCampaignPayload = {
                id: maxCampaignId + 1,
                name: campaignName.trim(),
                budget: budget,
                type: campaignType,
                status: status.toUpperCase(),
                networks: 'Google search;Search Partners',
                languages: targetLanguage,
                siteId: siteId || undefined,
            };

            const createdCampaign = await addCampaign(newCampaignPayload);
            const campaignId = createdCampaign.id;

            // Add generated ad groups, keywords, ads
            if (generatedData) {
                const adGroupMap = {}; // Map ad group names to IDs

                // Add Ad Groups
                if (generatedData.adGroups && Array.isArray(generatedData.adGroups)) {
                    for (const [index, ag] of generatedData.adGroups.entries()) {
                        // We rely on store to generate ID if we don't, but we need it for children.
                        // So we assume store uses our ID or returns the real one. 
                        // Since we awaited addCampaign, we know chaining works.
                        // However, addAdGroup in store expects an ID if we want to determine it locally.
                        // But for cloud, the store returns the real object.

                        const maxCpc = ag.maxCpc || 0.5;
                        const cpcValue = typeof maxCpc === 'number' ? maxCpc : parseFloat(maxCpc);

                        const newGroupPayload = {
                            // id will be auto-generated by store/backend if omitted, but we need reference for children
                            // If local, we can generic. If cloud, we get it back.
                            // To be safe, let store handle ID but we MUST await it.
                            campaignId: campaignId,
                            name: ag.name,
                            maxCpc: cpcValue,
                            type: 'Standard',
                            status: 'ENABLED'
                        };

                        const createdGroup = await addAdGroup(newGroupPayload);
                        adGroupMap[ag.name] = createdGroup.id;
                    }
                }

                // Add Keywords
                if (generatedData.keywords && Array.isArray(generatedData.keywords)) {
                    for (const kw of generatedData.keywords) {
                        const adGroupId = adGroupMap[kw.adGroup];
                        if (adGroupId) {
                            const matchType = kw.matchType || 'Broad';
                            const matchTypeUpper = matchType.toUpperCase();

                            await addKeyword({
                                adGroupId: adGroupId,
                                campaignId: campaignId,
                                text: kw.keyword,
                                matchType: matchTypeUpper,
                                status: 'ENABLED'
                            });
                        }
                    }
                }

                // Add Ads
                if (generatedData.ads && Array.isArray(generatedData.ads)) {
                    for (const ad of generatedData.ads) {
                        const adGroupId = adGroupMap[ad.adGroup];
                        if (adGroupId) {
                            await addAd({
                                adGroupId: adGroupId,
                                campaignId: campaignId,
                                headline1: ad.headline1 || '',
                                headline2: ad.headline2 || '',
                                headline3: ad.headline3 || '',
                                description1: ad.description1 || '',
                                description2: ad.description2 || '',
                                finalUrl: selectedSite?.url || 'https://example.com',
                                status: 'ENABLED'
                            });
                        }
                    }
                }
            }

            // Track campaign creation
            trackCampaignCreated(generatedData ? 'ai' : 'manual', {
                type: campaignType,
                generateAdGroups: generateAdGroups && !!generatedData?.adGroups,
                generateKeywords: generateKeywords && !!generatedData?.keywords,
                generateAds: generateAds && !!generatedData?.ads,
            });

            handleClose();
        } catch (err) {
            console.error('Failed to create campaign:', err);
            setError(t('create_campaign.messages.creation_failed') + ': ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClose = () => {
        setActiveStep(0);
        setCampaignName('');
        setBudget(50);
        setCampaignType('Search');
        setStatus('Paused');
        setSiteId('');
        setCampaignGoal('');
        setTargetLanguage('en');
        setGenerateAdGroups(true);
        setGenerateKeywords(true);
        setGenerateAds(true);
        setGeneratedData(null);
        setGenerationProgress('');
        setError(null);
        onClose();
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0: // Select Site
                return (
                    <Box>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <SiteIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                                {t('create_campaign.select_site.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('create_campaign.select_site.description')}
                            </Typography>
                        </Box>

                        {sites.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {t('create_campaign.select_site.no_sites')}
                                <Button
                                    size="small"
                                    sx={{ ml: 1 }}
                                    onClick={() => { handleClose(); navigate('/sites'); }}
                                >
                                    {t('create_campaign.select_site.go_to_sites')}
                                </Button>
                            </Alert>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel id="site-select-label">{t('create_campaign.select_site.title')}</InputLabel>
                                <Select
                                    labelId="site-select-label"
                                    value={siteId}
                                    label={t('create_campaign.select_site.title')}
                                    onChange={(e) => setSiteId(e.target.value)}
                                >
                                    {sites.map((site) => (
                                        <MenuItem key={site.id} value={site.id}>
                                            <Box>
                                                <Typography variant="body1">{site.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{site.url}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {selectedSite && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Typography variant="subtitle2">{selectedSite.name}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {selectedSite.url}
                                </Typography>
                                {selectedSite.description && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {selectedSite.description}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                );

            case 1: // Campaign Goals
                return (
                    <Box>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <GoalIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                                {t('create_campaign.campaign_goals.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('create_campaign.campaign_goals.description')}
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label={t('create_campaign.campaign_goals.goals_label')}
                            value={campaignGoal}
                            onChange={(e) => setCampaignGoal(e.target.value)}
                            placeholder={t('create_campaign.campaign_goals.goals_placeholder')}
                            sx={{ mb: 3 }}
                        />

                        {/* Language Selection */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>{t('create_campaign.campaign_goals.target_language')}</InputLabel>
                            <Select
                                value={targetLanguage}
                                label={t('create_campaign.campaign_goals.target_language')}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                startAdornment={<LanguageIcon sx={{ mr: 1, color: 'action.active' }} />}
                            >
                                {languages.map(lang => (
                                    <MenuItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        {/* What to Generate */}
                        <Typography variant="subtitle2" gutterBottom>
                            {t('create_campaign.campaign_goals.what_to_generate')}
                        </Typography>
                        <FormGroup sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateAdGroups}
                                        onChange={(e) => setGenerateAdGroups(e.target.checked)}
                                    />
                                }
                                label={t('create_campaign.campaign_goals.generate_ad_groups')}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateKeywords}
                                        onChange={(e) => setGenerateKeywords(e.target.checked)}
                                        disabled={!generateAdGroups}
                                    />
                                }
                                label={t('create_campaign.campaign_goals.generate_keywords')}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateAds}
                                        onChange={(e) => setGenerateAds(e.target.checked)}
                                        disabled={!generateAdGroups}
                                    />
                                }
                                label={t('create_campaign.campaign_goals.generate_ads')}
                            />
                        </FormGroup>

                        {isGenerating && (
                            <Box sx={{ mb: 2 }}>
                                <LinearProgress sx={{ mb: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    {generationProgress || t('create_campaign.campaign_goals.generating')}
                                </Typography>
                            </Box>
                        )}

                    </Box>
                );

            case 2: // Review & Edit
                return (
                    <Box>
                        {/* Campaign Name */}
                        <TextField
                            fullWidth
                            label={t('create_campaign.review.campaign_name')}
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder={t('create_campaign.review.campaign_name_placeholder')}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            autoFocus
                        />

                        {/* Campaign Type Selection */}
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
                            {t('create_campaign.review.campaign_type')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                            {campaignTypes.map((type) => (
                                <Chip
                                    key={type.value}
                                    icon={type.icon}
                                    label={type.label}
                                    onClick={() => setCampaignType(type.value)}
                                    variant={campaignType === type.value ? 'filled' : 'outlined'}
                                    color={campaignType === type.value ? 'primary' : 'default'}
                                    sx={{
                                        height: 40,
                                        borderRadius: 2,
                                        '& .MuiChip-icon': { fontSize: 18 },
                                        transition: 'all 0.2s ease',
                                        ...(campaignType === type.value && {
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        }),
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Budget Slider */}
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            {t('create_campaign.review.daily_budget')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', minWidth: 90 }}>
                                €{budget}
                            </Typography>
                            <Slider
                                value={budget}
                                onChange={(e, val) => setBudget(val)}
                                min={5}
                                max={500}
                                step={5}
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        {/* Status Toggle */}
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
                            {t('create_campaign.review.start_status')}
                        </Typography>
                        <ToggleButtonGroup
                            value={status}
                            exclusive
                            onChange={(e, val) => val && setStatus(val)}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton
                                value="Enabled"
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    gap: 1,
                                    ...(status === 'Enabled' && {
                                        backgroundColor: 'success.light',
                                        color: 'success.contrastText',
                                        '&:hover': { backgroundColor: 'success.main' },
                                    }),
                                }}
                            >
                                <EnabledIcon /> {t('create_campaign.review.launch_now')}
                            </ToggleButton>
                            <ToggleButton
                                value="Paused"
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    gap: 1,
                                    ...(status === 'Paused' && {
                                        backgroundColor: 'warning.light',
                                        color: 'warning.contrastText',
                                        '&:hover': { backgroundColor: 'warning.main' },
                                    }),
                                }}
                            >
                                <PausedIcon /> {t('create_campaign.review.start_paused')}
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Summary of what will be created */}
                        {generatedData && (
                            <Alert severity="success" icon={<AiIcon />} sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">{t('create_campaign.review.ai_generated')}</Typography>
                                <Typography variant="body2">
                                    {t('create_campaign.review.ad_groups_count', { count: generatedData.adGroups?.length || 0 })}, {' '}
                                    {t('create_campaign.review.keywords_count', { count: generatedData.keywords?.length || 0 })}, {' '}
                                    {t('create_campaign.review.ads_count', { count: generatedData.ads?.length || 0 })}
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 4,
                    overflow: 'visible',
                },
            }}
        >
            {/* Hero Icon */}
            {!fullScreen && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
                    <Avatar
                        sx={{
                            width: 72,
                            height: 72,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.35)',
                        }}
                    >
                        <CreateIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                </Box>
            )}

            <DialogContent sx={{ pt: fullScreen ? 3 : 3, pb: 2, px: 3 }}>
                {/* Header */}
                <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 0.5, mt: fullScreen ? 2 : 0 }}>
                    {t('create_campaign.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    {t('create_campaign.subtitle')}
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel={fullScreen}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={handleClose}>
                    {t('create_campaign.actions.cancel')}
                </Button>
                <Box sx={{ flex: 1 }} />
                {activeStep > 0 && (
                    <Button onClick={handleBack} disabled={isGenerating}>
                        {t('create_campaign.actions.back')}
                    </Button>
                )}
                {activeStep === 1 && (generateAdGroups || generateKeywords || generateAds) ? (
                    <AiAssistButton
                        onGenerate={handleAiGeneration}
                        isGenerating={isGenerating}
                        label={t('common.generate')} // Or specific label
                        variant="contained"
                        placeholder="Additional instructions (optional)..."
                    />
                ) : activeStep < 2 ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={(activeStep === 0 && !siteId) || isGenerating}
                    >
                        {t('create_campaign.actions.next')}
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                            },
                        }}
                    >
                        {t('create_campaign.actions.create')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CreateCampaignDialog;

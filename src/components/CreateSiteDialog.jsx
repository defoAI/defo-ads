// File: src/components/CreateSiteDialog.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Dialog for creating a new Site configuration.

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Avatar,
    Fade,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Language as SiteIcon,
    AutoAwesome as AiIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { SiteSchema } from '../schemas/adsSchemas';
import { generateFromPrompt, parseAiResponse } from '../services/aiService';
import AiAssistButton from './AiAssistButton';
import { trackSiteDialogOpen, trackSiteCreated, trackAiAssistClick, trackAiGenerationSuccess, trackAiGenerationError } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

const CreateSiteDialog = ({ open, onClose, onCreateCampaign }) => {
    const { t } = useTranslation();
    const { sites, addSite, prompts } = useAdsStore();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [usedAi, setUsedAi] = useState(false);
    const [createdSite, setCreatedSite] = useState(null); // Track successful creation

    // Track dialog open
    useEffect(() => {
        if (open) {
            trackSiteDialogOpen();
        }
    }, [open]);

    const handleAiAnalysis = async (instructions) => {
        if (!url) {
            setError(t('create_site.messages.url_required'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        trackAiAssistClick('site_analysis');
        const startTime = Date.now();

        try {
            const prompt = prompts.find(p => p.id === 'site_analysis');
            if (!prompt) throw new Error('Site Analysis prompt not found.');

            const result = await generateFromPrompt(prompt, {
                url,
                user_instructions: instructions ? `\n\nAdditional Instructions: ${instructions}` : ''
            });
            const data = parseAiResponse(result);

            if (data.name) setName(data.name);
            if (data.description) setDescription(data.description);
            if (data.seoKeywords) setSeoKeywords(data.seoKeywords);

            setUsedAi(true);
            trackAiGenerationSuccess('site_analysis', Date.now() - startTime);
        } catch (err) {
            console.error(err);
            setError(t('create_site.messages.analysis_failed'));
            trackAiGenerationError('site_analysis', err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = () => {
        // Check for duplicate domain
        try {
            const newHostname = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`).hostname.toLowerCase();
            const existingDuplicate = sites.find(site => {
                try {
                    const existingHostname = new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.toLowerCase();
                    return existingHostname === newHostname;
                } catch {
                    return false;
                }
            });
            if (existingDuplicate) {
                setError(t('create_site.messages.duplicate_domain', { domain: newHostname }));
                return;
            }
        } catch {
            // URL is invalid, let schema validation handle it
        }

        // Basic Validation
        try {
            SiteSchema.parse({
                name,
                url,
                description: description || undefined,
                seoKeywords: seoKeywords || undefined
            });
        } catch (e) {
            // Very basic error handling for now, Zod errors are an array
            if (e.errors) {
                setError(e.errors[0].message);
            } else {
                setError(e.message);
            }
            return;
        }

        // Generate next ID
        const maxId = sites.reduce((max, s) => Math.max(max, s.id || 0), 0);
        const newSite = {
            id: maxId + 1,
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            seoKeywords: seoKeywords.trim(),
        };

        addSite(newSite);
        trackSiteCreated(usedAi);
        setCreatedSite(newSite); // Show success step instead of closing
    };

    const handleClose = () => {
        setName('');
        setUrl('');
        setDescription('');
        setSeoKeywords('');
        setError(null);
        setCreatedSite(null);
        onClose();
    };

    const handleCreateCampaignClick = () => {
        const site = createdSite;
        handleClose();
        // Trigger campaign creation with this site if callback provided
        if (onCreateCampaign && site) {
            onCreateCampaign(site.id);
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
            disablePortal
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
                        <SiteIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                </Box>
            )}

            <DialogContent sx={{ pt: fullScreen ? 3 : 3, pb: 2, px: 3 }}>
                {createdSite ? (
                    /* ===== SUCCESS SCREEN ===== */
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'success.light',
                                color: 'success.main',
                                mx: 'auto',
                                mb: 2
                            }}
                        >
                            <SiteIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('create_site.success.title', 'Site Created!')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            "{createdSite.name}" {t('create_site.success.message', 'is ready. What would you like to do next?')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 280, mx: 'auto' }}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleCreateCampaignClick}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                    },
                                }}
                            >
                                {t('create_site.success.create_campaign', 'Create a Campaign')}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={handleClose}
                            >
                                {t('common.done', 'Done')}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    /* ===== FORM ===== */
                    <>
                        {/* Header */}
                        <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 0.5, mt: fullScreen ? 2 : 0 }}>
                            {t('create_site.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                            {t('create_site.subtitle')}
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {/* URL - First to enable AI analysis */}
                        <TextField
                            fullWidth
                            label={t('create_site.site_url')}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={t('create_site.site_url_placeholder')}
                            variant="outlined"
                            sx={{ mb: 1 }}
                            autoFocus
                        />

                        {/* AI Generation Section - prominent like CreateCampaignDialog */}
                        <Box sx={{ mb: 3 }}>
                            <AiAssistButton
                                onGenerate={handleAiAnalysis}
                                isGenerating={isGenerating}
                                disabled={!url}
                                label={t('create_site.analyze_with_ai')}
                                variant="outlined"
                                fullWidth
                                placeholder="e.g., Focus on eco-friendly aspects, highlight premium quality..."
                            />
                        </Box>

                        {/* Name */}
                        <TextField
                            fullWidth
                            label={t('create_site.site_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('create_site.site_name_placeholder')}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />

                        {/* Description */}
                        <TextField
                            fullWidth
                            label={t('create_site.description')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('create_site.description_placeholder')}
                            variant="outlined"
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />

                        {/* SEO Keywords */}
                        <TextField
                            fullWidth
                            label={t('create_site.seo_keywords')}
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            placeholder={t('create_site.seo_keywords_placeholder')}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                    </>
                )}
            </DialogContent>

            {!createdSite && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={handleClose} sx={{ flex: 1 }}>
                        {t('create_site.actions.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                        sx={{
                            flex: 2,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                            },
                        }}
                    >
                        {t('create_site.actions.create')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default CreateSiteDialog;

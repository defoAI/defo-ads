// File: src/views/SiteDetailView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Full-page editor for Site configuration with AI analysis capabilities.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    IconButton,
    InputAdornment,
    Breadcrumbs,
    Link,
    LinearProgress,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as BackIcon,
    AutoAwesome as AiIcon,
    Language as SiteIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { generateFromPrompt, parseAiResponse } from '../services/aiService';
import AiAssistButton from '../components/AiAssistButton';
import { useTranslation } from 'react-i18next';

const SiteDetailView = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { sites, updateSite, prompts } = useAdsStore();

    const [siteData, setSiteData] = useState({
        name: '',
        url: '',
        description: '',
        seoKeywords: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load site data on mount
    useEffect(() => {
        const siteId = parseInt(id, 10);
        const site = sites.find(s => s.id === siteId);

        if (site) {
            setSiteData({
                name: site.name || '',
                url: site.url || '',
                description: site.description || '',
                seoKeywords: site.seoKeywords || '',
            });
        } else {
            setError(t('site_detail.not_found'));
        }
    }, [id, sites, t]);

    const handleChange = (field, value) => {
        setSiteData(prev => ({ ...prev, [field]: value }));
        // Clear success message on edit
        if (success) setSuccess(null);
    };

    const handleSave = () => {
        if (!siteData.name.trim()) {
            setError(t('site_detail.messages.name_required'));
            return;
        }

        const siteId = parseInt(id, 10);
        updateSite(siteId, siteData);
        setSuccess(t('site_detail.messages.updated'));
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleAiAnalysis = async (instructions) => {
        if (!siteData.url) {
            setError(t('site_detail.messages.url_required'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            const prompt = prompts.find(p => p.id === 'site_analysis');
            if (!prompt) throw new Error('Site Analysis prompt not found.');

            const result = await generateFromPrompt(prompt, {
                url: siteData.url,
                user_instructions: instructions ? `\n\nAdditional Instructions: ${instructions}` : ''
            });
            const data = parseAiResponse(result);

            setSiteData(prev => ({
                ...prev,
                name: data.name || prev.name,
                description: data.description || prev.description,
                seoKeywords: data.seoKeywords || prev.seoKeywords,
            }));

            setSuccess(t('site_detail.messages.analysis_success'));
        } catch (err) {
            console.error(err);
            setError(t('site_detail.messages.analysis_failed'));
        } finally {
            setIsGenerating(false);
        }
    };

    if (error === t('site_detail.not_found')) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>{t('site_detail.not_found')}</Typography>
                <Button variant="contained" onClick={() => navigate('/sites')}>{t('navigation.back_to_sites')}</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            {/* Navigation & Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/sites')}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    {t('navigation.back_to_list')}
                </Button>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" onClick={() => navigate('/sites')} sx={{ cursor: 'pointer' }}>
                        {t('nav.sites')}
                    </Link>
                    <Typography color="text.primary">{siteData.name || t('site_detail.edit_site')}</Typography>
                </Breadcrumbs>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                {isGenerating && (
                    <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <SiteIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {t('site_detail.edit_site')}
                    </Typography>
                </Box>

                {error && error !== t('site_detail.not_found') && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>
                )}

                <Box component="form" noValidate autoComplete="off">
                    <TextField
                        fullWidth
                        label={t('site_detail.site_name')}
                        value={siteData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth
                            label={t('site_detail.site_url')}
                            value={siteData.url}
                            onChange={(e) => handleChange('url', e.target.value)}
                            margin="normal"
                            placeholder="https://example.com"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={() => window.open(siteData.url, '_blank')} disabled={!siteData.url}>
                                            <SiteIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <AiAssistButton
                                onGenerate={handleAiAnalysis}
                                isGenerating={isGenerating}
                                disabled={!siteData.url}
                                label={t('site_detail.analyze_with_ai')}
                                variant="contained"
                                size="large"
                            />
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label={t('site_detail.description')}
                        value={siteData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                        placeholder="Marketing description of the site..."
                        helperText={t('site_detail.analyze_with_ai_helper')}
                    />

                    <TextField
                        fullWidth
                        label={t('site_detail.seo_keywords')}
                        value={siteData.seoKeywords}
                        onChange={(e) => handleChange('seoKeywords', e.target.value)}
                        margin="normal"
                        placeholder="shoes, summer sale, fashion..."
                        helperText={t('site_detail.seo_keywords_helper')}
                    />
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/sites')}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ px: 4 }}
                    >
                        {t('ad_detail.save_changes')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SiteDetailView;

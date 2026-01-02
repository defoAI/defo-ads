// File: src/views/AdDetail/AdLandingPagesTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Landing pages management tab with AI generation support.

import React from 'react';
import {
    Box,
    Typography,
    Button,
    Divider,
    Stack,
    Card,
    IconButton,
    TextField,
    Grid,
    InputAdornment,
} from '@mui/material';
import {
    OpenInNew as OpenIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import AiAssistButton from '../../components/AiAssistButton';
import { useTranslation } from 'react-i18next';

const AdLandingPagesTab = ({
    landingPages,
    onAdd,
    onRemove,
    onChange,
    onGenerate,
    isGenerating,
}) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <OpenIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_landing_pages.title')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('ad_landing_pages.description')}
            </Typography>

            {/* Generate Landing Pages */}
            <Box sx={{ mb: 3 }}>
                <AiAssistButton
                    onGenerate={onGenerate}
                    isGenerating={isGenerating}
                    label={t('ad_landing_pages.generate_button')}
                    variant="contained"
                    placeholder="e.g., Focus on product pages, include pricing page..."
                />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Landing Page Editor */}
            <Stack spacing={2}>
                {landingPages.map((page, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <OpenIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2">{t('ad_landing_pages.landing_page', { num: index + 1 })}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => onRemove(index)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label={t('ad_landing_pages.url')}
                                    value={page.url || ''}
                                    onChange={(e) => onChange(index, 'url', e.target.value)}
                                    placeholder="https://example.com/page"
                                    size="small"
                                    InputProps={{
                                        endAdornment: page.url && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => window.open(page.url, '_blank')}
                                                >
                                                    <OpenIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label={t('ad_landing_pages.label')}
                                    value={page.label || ''}
                                    onChange={(e) => onChange(index, 'label', e.target.value)}
                                    placeholder="e.g., Product Page"
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Card>
                ))}
            </Stack>

            <Button
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{ mt: 2 }}
                variant="outlined"
            >
                {t('ad_landing_pages.add_landing_page')}
            </Button>

            {landingPages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 2, mt: 2 }}>
                    <OpenIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        {t('ad_landing_pages.no_landing_pages')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AdLandingPagesTab;

// File: src/views/AdDetail/AdSitelinksTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Sitelink extensions editor with AI generation support.

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    Stack,
    Card,
    IconButton,
    TextField,
} from '@mui/material';
import {
    Link as SitelinkIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import AiAssistButton from '../../components/AiAssistButton';
import { useTranslation } from 'react-i18next';

const AdSitelinksTab = ({
    sitelinks,
    onAdd,
    onRemove,
    onChange,
    onLoadFromSite,
    selectedSiteId,
    onSelectedSiteChange,
    sites,
    onGenerate,
    isGenerating,
}) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SitelinkIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_sitelinks.title')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('ad_sitelinks.description')}
            </Typography>

            {/* Load from Site / Generate */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('ad_sitelinks.load_from_site')}</InputLabel>
                        <Select
                            value={selectedSiteId}
                            label={t('ad_sitelinks.load_from_site')}
                            onChange={(e) => onSelectedSiteChange(e.target.value)}
                        >
                            <MenuItem value="">{t('ad_sitelinks.select_site')}</MenuItem>
                            {sites.map(site => (
                                <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button
                        variant="outlined"
                        onClick={onLoadFromSite}
                        disabled={!selectedSiteId}
                        fullWidth
                        sx={{ height: '100%' }}
                    >
                        {t('ad_sitelinks.load')}
                    </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                    <AiAssistButton
                        onGenerate={onGenerate}
                        isGenerating={isGenerating}
                        label={t('ad_sitelinks.generate_button')}
                        variant="contained"
                        placeholder="e.g., Focus on product categories, highlight special offers..."
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Sitelink Editor */}
            <Stack spacing={2}>
                {sitelinks.map((link, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SitelinkIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2">{t('ad_sitelinks.sitelink', { num: index + 1 })}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => onRemove(index)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label={t('ad_sitelinks.link_text')}
                                    value={link.text || ''}
                                    onChange={(e) => onChange(index, 'text', e.target.value)}
                                    inputProps={{ maxLength: 25 }}
                                    helperText={t('ad_sitelinks.char_limit_25', { count: (link.text || '').length })}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label={t('ad_sitelinks.url_path')}
                                    value={link.url || ''}
                                    onChange={(e) => onChange(index, 'url', e.target.value)}
                                    placeholder={t('ad_sitelinks.url_placeholder')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label={t('ad_sitelinks.description_line_1')}
                                    value={link.description1 || ''}
                                    onChange={(e) => onChange(index, 'description1', e.target.value)}
                                    inputProps={{ maxLength: 35 }}
                                    helperText={t('ad_sitelinks.char_limit_35', { count: (link.description1 || '').length })}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label={t('ad_sitelinks.description_line_2')}
                                    value={link.description2 || ''}
                                    onChange={(e) => onChange(index, 'description2', e.target.value)}
                                    inputProps={{ maxLength: 35 }}
                                    helperText={t('ad_sitelinks.char_limit_35', { count: (link.description2 || '').length })}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Card>
                ))}
            </Stack>

            {sitelinks.length < 4 && (
                <Button
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                    sx={{ mt: 2 }}
                    variant="outlined"
                >
                    {t('ad_sitelinks.add_sitelink')}
                </Button>
            )}

            {sitelinks.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <SitelinkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        {t('ad_sitelinks.no_sitelinks')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AdSitelinksTab;

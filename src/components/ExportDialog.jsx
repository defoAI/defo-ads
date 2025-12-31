// File: src/components/ExportDialog.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    Stack,
    Chip,
    Alert
} from '@mui/material';
import {
    CloudDownload as DownloadIcon,
    CheckCircle as SuccessIcon,
    Campaign as CampaignIcon,
    ViewList as AdGroupIcon,
    TextFields as KeywordIcon,
    Article as AdsIcon,
    Language as SiteIcon
} from '@mui/icons-material';
import Papa from 'papaparse';
import { useAdsStore } from '../store/useAdsStore';
import { trackExportDialogOpen, trackExportSuccess } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

const ExportDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [format, setFormat] = useState('csv');
    const [entities, setEntities] = useState({
        sites: true,
        campaigns: true,
        adGroups: true,
        keywords: true,
        ads: true
    });
    const [exportSuccess, setExportSuccess] = useState(null);

    const { campaigns, adGroups, keywords, ads, sites } = useAdsStore();

    // Track dialog open
    useEffect(() => {
        if (open) {
            trackExportDialogOpen();
        }
    }, [open]);

    const entityConfigs = [
        { key: 'sites', label: t('nav.sites'), icon: <SiteIcon />, count: sites.length },
        { key: 'campaigns', label: t('nav.campaigns'), icon: <CampaignIcon />, count: campaigns.length },
        { key: 'adGroups', label: t('nav.adgroups'), icon: <AdGroupIcon />, count: adGroups.length },
        { key: 'keywords', label: t('nav.keywords'), icon: <KeywordIcon />, count: keywords.length },
        { key: 'ads', label: t('nav.ads'), icon: <AdsIcon />, count: ads.length }
    ];

    const handleReset = () => {
        setFormat('csv');
        setEntities({
            sites: true,
            campaigns: true,
            adGroups: true,
            keywords: true,
            ads: true
        });
        setExportSuccess(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleEntityChange = (key) => {
        setEntities(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectAll = () => {
        const allSelected = Object.values(entities).every(v => v);
        const newValue = !allSelected;
        setEntities({
            sites: newValue,
            campaigns: newValue,
            adGroups: newValue,
            keywords: newValue,
            ads: newValue
        });
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = () => {
        const exportData = {};
        const stats = {};

        if (entities.sites && sites.length > 0) {
            exportData.sites = sites;
            stats.sites = sites.length;
        }
        if (entities.campaigns && campaigns.length > 0) {
            exportData.campaigns = campaigns;
            stats.campaigns = campaigns.length;
        }
        if (entities.adGroups && adGroups.length > 0) {
            exportData.adGroups = adGroups;
            stats.adGroups = adGroups.length;
        }
        if (entities.keywords && keywords.length > 0) {
            exportData.keywords = keywords;
            stats.keywords = keywords.length;
        }
        if (entities.ads && ads.length > 0) {
            exportData.ads = ads;
            stats.ads = ads.length;
        }

        const timestamp = new Date().toISOString().split('T')[0];

        if (format === 'json') {
            const jsonContent = JSON.stringify(exportData, null, 2);
            downloadFile(jsonContent, `defo-ads-export-${timestamp}.json`, 'application/json');
        } else {
            // CSV format - export each entity type as a separate file or combined
            // For simplicity and Google Ads Editor compatibility, we'll combine all into one CSV
            // with a row type indicator, or export the most important ones (campaigns, adgroups, keywords, ads)

            // Google Ads Editor expects a specific format, so we'll create a combined export
            const allRows = [];

            // Add campaigns
            if (exportData.campaigns) {
                exportData.campaigns.forEach(c => {
                    allRows.push({
                        'Row Type': 'Campaign',
                        'Campaign': c.Campaign || c.name || '',
                        'Campaign Status': c.Status || c['Campaign Status'] || 'Enabled',
                        'Budget': c.Budget || '',
                        'Campaign Type': c.Type || c['Campaign Type'] || 'Search',
                        'Networks': c.Networks || '',
                        'Languages': c.Languages || '',
                        ...c
                    });
                });
            }

            // Add ad groups
            if (exportData.adGroups) {
                exportData.adGroups.forEach(ag => {
                    allRows.push({
                        'Row Type': 'Ad Group',
                        'Campaign': ag.Campaign || '',
                        'Ad Group': ag['Ad Group'] || ag.name || '',
                        'Ad Group Status': ag.Status || ag['Ad Group Status'] || 'Enabled',
                        'Max CPC': ag['Max CPC'] || ag.maxCpc || '',
                        ...ag
                    });
                });
            }

            // Add keywords
            if (exportData.keywords) {
                exportData.keywords.forEach(kw => {
                    allRows.push({
                        'Row Type': 'Keyword',
                        'Campaign': kw.Campaign || '',
                        'Ad Group': kw['Ad Group'] || '',
                        'Keyword': kw.Keyword || '',
                        'Criterion Type': kw['Criterion Type'] || kw.matchType || 'Broad',
                        'Status': kw.Status || 'Enabled',
                        ...kw
                    });
                });
            }

            // Add ads
            if (exportData.ads) {
                exportData.ads.forEach(ad => {
                    allRows.push({
                        'Row Type': 'Ad',
                        'Campaign': ad.Campaign || '',
                        'Ad Group': ad['Ad Group'] || '',
                        'Ad type': ad['Ad type'] || 'Responsive search ad',
                        'Headline 1': ad['Headline 1'] || '',
                        'Headline 2': ad['Headline 2'] || '',
                        'Headline 3': ad['Headline 3'] || '',
                        'Description 1': ad['Description 1'] || '',
                        'Description 2': ad['Description 2'] || '',
                        'Final URL': ad['Final URL'] || '',
                        'Status': ad.Status || 'Enabled',
                        ...ad
                    });
                });
            }

            // Sites are exported separately since they're not part of Google Ads Editor format
            if (exportData.sites) {
                const sitesContent = Papa.unparse(exportData.sites);
                downloadFile(sitesContent, `defo-ads-sites-${timestamp}.csv`, 'text/csv');
            }

            if (allRows.length > 0) {
                const csvContent = Papa.unparse(allRows);
                downloadFile(csvContent, `defo-ads-export-${timestamp}.csv`, 'text/csv');
            }
        }

        setExportSuccess(stats);
        trackExportSuccess(format, entities);
    };

    const selectedCount = Object.values(entities).filter(v => v).length;
    const hasData = entityConfigs.some(e => e.count > 0 && entities[e.key]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DownloadIcon color="primary" />
                {t('export.title')}
            </DialogTitle>

            {!exportSuccess ? (
                <>
                    <DialogContent>
                        <Stack spacing={3}>
                            {/* Format Selection */}
                            <FormControl component="fieldset">
                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                                    {t('export.format')}
                                </FormLabel>
                                <RadioGroup
                                    row
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    <FormControlLabel
                                        value="csv"
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="body1">{t('export.csv')}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('export.csv_desc')}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="json"
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="body1">{t('export.json')}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('export.json_desc')}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>

                            {/* Entity Selection */}
                            <FormControl component="fieldset">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                                        {t('export.select_entities')}
                                    </FormLabel>
                                    <Button size="small" onClick={handleSelectAll}>
                                        {Object.values(entities).every(v => v) ? t('export.deselect_all') : t('export.select_all')}
                                    </Button>
                                </Box>
                                <FormGroup>
                                    {entityConfigs.map(entity => (
                                        <FormControlLabel
                                            key={entity.key}
                                            control={
                                                <Checkbox
                                                    checked={entities[entity.key]}
                                                    onChange={() => handleEntityChange(entity.key)}
                                                    disabled={entity.count === 0}
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {entity.icon}
                                                    <Typography>{entity.label}</Typography>
                                                    <Chip
                                                        label={entity.count}
                                                        size="small"
                                                        color={entity.count > 0 ? 'primary' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>

                            {/* Info Alert */}
                            {format === 'csv' && (
                                <Alert severity="info" variant="outlined">
                                    {t('export.messages.csv_info')}
                                </Alert>
                            )}
                            {format === 'json' && (
                                <Alert severity="info" variant="outlined">
                                    {t('export.messages.json_info')}
                                </Alert>
                            )}
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose}>{t('common.cancel')}</Button>
                        <Button
                            onClick={handleExport}
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            disabled={selectedCount === 0 || !hasData}
                        >
                            {selectedCount === 1 ? t('export.export_entity', { count: selectedCount }) : t('export.export_entities', { count: selectedCount })}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogContent sx={{ textAlign: 'center', py: 5 }}>
                        <SuccessIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>{t('export.success_title')}</Typography>

                        <Stack spacing={1} sx={{ mt: 3, maxWidth: 300, mx: 'auto', textAlign: 'left' }}>
                            {exportSuccess.sites && (
                                <Typography><strong>{t('export.stats.sites')}</strong> {exportSuccess.sites}</Typography>
                            )}
                            {exportSuccess.campaigns && (
                                <Typography><strong>{t('export.stats.campaigns')}</strong> {exportSuccess.campaigns}</Typography>
                            )}
                            {exportSuccess.adGroups && (
                                <Typography><strong>{t('export.stats.ad_groups')}</strong> {exportSuccess.adGroups}</Typography>
                            )}
                            {exportSuccess.keywords && (
                                <Typography><strong>{t('export.stats.keywords')}</strong> {exportSuccess.keywords}</Typography>
                            )}
                            {exportSuccess.ads && (
                                <Typography><strong>{t('export.stats.ads')}</strong> {exportSuccess.ads}</Typography>
                            )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                            {format === 'json' ? t('export.messages.downloaded_json') : t('export.messages.downloaded_csv')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant="contained" autoFocus>
                            {t('common.done')}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default ExportDialog;

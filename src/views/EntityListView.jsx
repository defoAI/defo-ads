// File: src/views/EntityListView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Generic entity list with icon-enhanced status columns and improved empty states.
// Now includes AI generation for entities.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper, Stack, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
    CloudUpload as ImportIcon,
    Delete as DeleteIcon,
    CheckCircle as EnabledIcon,
    PauseCircle as PausedIcon,
    RemoveCircle as RemovedIcon,
    ViewList as AdGroupIcon,
    TextFields as KeywordIcon,
    Article as AdsIcon,
    FormatQuote as BroadIcon,
    FormatQuote as PhraseIcon,
    FormatListBulleted as ExactIcon,
    AutoAwesome as AiIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { generateFromPrompt, parseAiResponse } from '../services/aiService';
import AiAssistButton from '../components/AiAssistButton';
import ImportDialog from '../components/ImportDialog';
import { trackEntityDeleted, trackAiEntityGenerated, trackAiAssistClick, trackAiGenerationSuccess, trackAiGenerationError } from '../services/analyticsService';
import EmptyState from '../components/EmptyState';
import { useTranslation } from 'react-i18next';

// Status icon/color mapping
const statusConfig = {
    Enabled: { icon: <EnabledIcon fontSize="small" />, color: 'success' },
    Paused: { icon: <PausedIcon fontSize="small" />, color: 'warning' },
    Removed: { icon: <RemovedIcon fontSize="small" />, color: 'error' },
};

// Match type icon mapping
const matchTypeConfig = {
    Broad: { icon: <BroadIcon fontSize="small" />, color: 'info' },
    Phrase: { icon: <PhraseIcon fontSize="small" />, color: 'secondary' },
    Exact: { icon: <ExactIcon fontSize="small" />, color: 'primary' },
};

// Entity icon mapping for empty states
const entityIcons = {
    adGroup: <AdGroupIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.5 }} />,
    keyword: <KeywordIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.5 }} />,
    ad: <AdsIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.5 }} />,
};

/**
 * Generic View for displaying grids of entities (Ad Groups, Keywords, Ads).
 * Handles both "Global" (all items) and "Filtered" (contextual) modes.
 */
const EntityListView = ({ type, filter }) => {
    const store = useAdsStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState('');

    const [selectedAdGroup, setSelectedAdGroup] = useState('');
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    let rows = [];
    let columns = [];
    let title = '';

    // Status column definition (reusable)
    const statusColumn = {
        field: 'Status',
        headerName: t('entity_list.status'),
        width: 130,
        renderCell: (params) => {
            const config = statusConfig[params.value] || statusConfig.Paused;
            return (
                <Chip
                    icon={config.icon}
                    label={params.value}
                    size="small"
                    color={config.color}
                    variant="outlined"
                />
            );
        },
    };

    // Selector Logic
    switch (type) {
        case 'adGroup':
            title = t('adGroup.title');
            rows = filter?.campaignId
                ? store.getAdGroupsByCampaign(filter.campaignId)
                : store.adGroups;
            columns = [
                { field: 'id', headerName: t('entity_list.columns.id'), width: 70 },
                { field: 'Ad Group', headerName: t('entity_list.columns.ad_group_name'), flex: 1, editable: true },
                {
                    field: 'Campaign',
                    headerName: t('entity_list.columns.campaign'),
                    width: 200,
                    renderCell: (params) => {
                        const campaign = store.campaigns.find(c => c.Campaign === params.value);
                        return campaign ? (
                            <Box
                                component="span"
                                onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign.id}`); }}
                                sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                {params.value}
                            </Box>
                        ) : params.value;
                    }
                },
                { field: 'Max CPC', headerName: t('entity_list.columns.max_cpc'), type: 'number', width: 110, editable: true },
                statusColumn,
            ];
            break;
        case 'keyword':
            title = t('keyword.title');
            rows = store.keywords;
            columns = [
                { field: 'id', headerName: t('entity_list.columns.id'), width: 70 },
                { field: 'Keyword', headerName: t('entity_list.columns.keyword'), flex: 1, editable: true },
                {
                    field: 'Criterion Type',
                    headerName: t('entity_list.columns.match_type'),
                    width: 140,
                    renderCell: (params) => {
                        const config = matchTypeConfig[params.value] || matchTypeConfig.Broad;
                        return (
                            <Chip
                                icon={config.icon}
                                label={params.value}
                                size="small"
                                color={config.color}
                                variant="outlined"
                            />
                        );
                    },
                },
                {
                    field: 'Ad Group',
                    headerName: t('entity_list.columns.ad_group'),
                    width: 150,
                    renderCell: (params) => {
                        const adGroup = store.adGroups.find(ag => ag['Ad Group'] === params.value);
                        if (!adGroup) return params.value;
                        const campaign = store.campaigns.find(c => c.Campaign === adGroup.Campaign);
                        return campaign ? (
                            <Box
                                component="span"
                                onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign.id}`); }}
                                sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                {params.value}
                            </Box>
                        ) : params.value;
                    }
                },
                statusColumn,
            ];
            break;
        case 'ad':
            title = t('ad.title');
            rows = store.ads;
            columns = [
                { field: 'id', headerName: t('entity_list.columns.id'), width: 70 },
                { field: 'Headline 1', headerName: t('entity_list.columns.headline_1'), flex: 1 },
                statusColumn,
            ];
            break;
        default:
            break;
    }

    // Hide 'Campaign' column if we are already IN a campaign view
    if (filter?.campaignId) {
        columns = columns.filter(c => c.field !== 'Campaign');
    }

    const handleDelete = () => {
        const selectedIds = Array.from(selectionModel.ids);
        if (window.confirm(t('confirmations.delete_items', { count: selectedIds.length }))) {
            switch (type) {
                case 'adGroup': store.deleteAdGroups(selectedIds); break;
                case 'keyword': store.deleteKeywords(selectedIds); break;
                case 'ad': store.deleteAds(selectedIds); break;
            }
            trackEntityDeleted(type, selectedIds.length);
            setSelectionModel({ type: 'include', ids: new Set() });
        }
    };

    const handleAiGenerate = async (instructions) => {
        setIsGenerating(true);
        setError(null);
        trackAiAssistClick(`${type}_generation`);
        const startTime = Date.now();

        try {
            // Build context based on entity type
            let prompt, context, generatedItems = [];

            if (type === 'adGroup') {
                if (!selectedCampaign) {
                    throw new Error(t('entity_list.dialog.select_campaign'));
                }
                const campaign = store.campaigns.find(c => c.id === selectedCampaign);
                prompt = store.prompts.find(p => p.id === 'ad_group_generation') || {
                    template: `Generate 3 ad groups for the following campaign.
Campaign: ${campaign?.Campaign || 'Unknown'}
Campaign Type: ${campaign?.Type || 'Search'}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Return a JSON array of ad groups with fields:
- "Ad Group": name of the ad group
- "Max CPC": suggested max CPC in EUR (number)
- "Status": "Paused"`
                };

                const result = await generateFromPrompt(
                    { template: prompt.template || prompt },
                    { campaign_name: campaign?.Campaign, instructions: instructions || '' }
                );
                const data = parseAiResponse(result);
                const items = Array.isArray(data) ? data : [data];

                items.forEach((item, idx) => {
                    store.setAdGroups([...store.adGroups, {
                        id: Date.now() + idx,
                        campaignId: selectedCampaign,
                        'Ad Group': item['Ad Group'] || item.name || `Ad Group ${idx + 1}`,
                        'Max CPC': item['Max CPC'] || 0.50,
                        'Campaign': campaign?.Campaign,
                        Status: item.Status || 'Paused',
                    }]);
                });
            } else if (type === 'keyword') {
                if (!selectedAdGroup) {
                    throw new Error(t('entity_list.dialog.select_ad_group'));
                }
                const adGroup = store.adGroups.find(ag => ag.id === selectedAdGroup);
                prompt = store.prompts.find(p => p.id === 'keyword_generation') || {
                    template: `Generate 10 relevant keywords for this ad group.
Ad Group: ${adGroup?.['Ad Group'] || 'Unknown'}
Campaign: ${adGroup?.Campaign || 'Unknown'}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Return a JSON array of keywords with fields:
- "Keyword": the keyword text
- "Criterion Type": "Exact", "Phrase", or "Broad"
- "Status": "Paused"`
                };

                const result = await generateFromPrompt(
                    { template: prompt.template || prompt },
                    { ad_group_name: adGroup?.['Ad Group'], instructions: instructions || '' }
                );
                const data = parseAiResponse(result);
                const items = Array.isArray(data) ? data : [data];

                const newKeywords = items.map((item, idx) => ({
                    id: Date.now() + idx,
                    adGroupId: selectedAdGroup,
                    Keyword: item.Keyword || item.keyword,
                    'Criterion Type': item['Criterion Type'] || item.matchType || 'Broad',
                    'Ad Group': adGroup?.['Ad Group'],
                    Status: item.Status || 'Paused',
                }));
                store.setKeywords([...store.keywords, ...newKeywords]);
            } else if (type === 'ad') {
                if (!selectedAdGroup) {
                    throw new Error(t('entity_list.dialog.select_ad_group'));
                }
                const adGroup = store.adGroups.find(ag => ag.id === selectedAdGroup);
                const keywords = store.getKeywordsByAdGroup(selectedAdGroup);

                const result = await generateFromPrompt(
                    store.prompts.find(p => p.id === 'ad_copy_generation'),
                    {
                        campaign_name: adGroup?.Campaign || 'Unknown',
                        ad_group_name: adGroup?.['Ad Group'] || 'Unknown',
                        keywords: keywords.map(k => k.Keyword).join(', '),
                        site_context: '',
                        user_instructions: instructions || ''
                    }
                );
                const data = parseAiResponse(result);

                store.setAds([...store.ads, {
                    id: Date.now(),
                    adGroupId: selectedAdGroup,
                    'Ad Group': adGroup?.['Ad Group'],
                    'Ad type': 'Responsive search ad',
                    'Headline 1': data['Headline 1'],
                    'Headline 2': data['Headline 2'],
                    'Headline 3': data['Headline 3'],
                    'Description 1': data['Description 1'],
                    'Description 2': data['Description 2'],
                    Status: 'Paused',
                }]);
            }

            setAiDialogOpen(false);
            trackAiEntityGenerated(type);
            trackAiGenerationSuccess(`${type}_generation`, Date.now() - startTime);
        } catch (err) {
            console.error('AI Generation Error:', err);
            setError(err.message);
            trackAiGenerationError(`${type}_generation`, err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedCount = selectionModel.ids.size;

    // Handle Empty State
    if (!rows || rows.length === 0) {
        // Use generic keys defined in translation.json: adGroup, keyword, ad
        const emptyTitle = t(`${type}.empty_state.title`);
        const emptyDesc = filter
            ? t(`${type}.empty_state.description_filtered`)
            : t(`${type}.empty_state.description`);

        // Features directly from translation keys
        const features = [
            t(`${type}.empty_state.feature_1`),
            t(`${type}.empty_state.feature_2`),
            t(`${type}.empty_state.feature_3`)
        ];

        return (
            <Box sx={{ width: '100%' }}>
                <EmptyState
                    icon={entityIcons[type]}
                    title={emptyTitle}
                    description={emptyDesc}
                    features={features}
                    actions={
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="outlined"
                                startIcon={<ImportIcon />}
                                onClick={() => setImportDialogOpen(true)}
                            >
                                {t('common.import_csv')}
                            </Button>
                            <AiAssistButton
                                onGenerate={() => setAiDialogOpen(true)}
                                isGenerating={isGenerating}
                                label={t(`${type}.actions.generate`)}
                                variant="contained"
                            />
                        </Stack>
                    }
                />

                {/* AI Generation Dialog */}
                <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AiIcon color="primary" /> {t('entity_list.dialog.generate_title', { type: title })}
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('entity_list.dialog.select_parent')}
                        </Typography>

                        {type === 'adGroup' && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('entity_list.dialog.campaign')}</InputLabel>
                                <Select
                                    value={selectedCampaign}
                                    onChange={(e) => setSelectedCampaign(e.target.value)}
                                    label={t('entity_list.dialog.campaign')}
                                >
                                    {store.campaigns.map(c => (
                                        <MenuItem key={c.id} value={c.id}>{c.Campaign}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {(type === 'keyword' || type === 'ad') && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('entity_list.dialog.ad_group')}</InputLabel>
                                <Select
                                    value={selectedAdGroup}
                                    onChange={(e) => setSelectedAdGroup(e.target.value)}
                                    label={t('entity_list.dialog.ad_group')}
                                >
                                    {store.adGroups.map(ag => (
                                        <MenuItem key={ag.id} value={ag.id}>{ag['Ad Group']} ({ag.Campaign})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setAiDialogOpen(false)}>{t('common.cancel')}</Button>
                        <AiAssistButton
                            onGenerate={handleAiGenerate}
                            isGenerating={isGenerating}
                            label={t('common.generate')}
                            variant="contained"
                            placeholder={`e.g., Focus on ${type === 'keyword' ? 'long-tail keywords' : 'mobile users'}...`}
                        />
                    </DialogActions>
                </Dialog>

                <ImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />
            </Box >
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {t(`${type}.counts.count_other`, { count: rows.length })}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<ImportIcon />}
                        onClick={() => setImportDialogOpen(true)}
                    >
                        {t('common.import')}
                    </Button>
                    {selectedCount > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                        >
                            {t('common.delete')} ({selectedCount})
                        </Button>
                    )}
                    <AiAssistButton
                        onGenerate={() => setAiDialogOpen(true)}
                        isGenerating={isGenerating}
                        label={t(`${type}.actions.add_ai`)}
                        variant="outlined"
                        size="small"
                    />
                </Stack>
            </Box>

            {/* AI Generation Dialog */}
            <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AiIcon color="primary" /> {t('entity_list.dialog.generate_title', { type: title })}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('entity_list.dialog.select_parent')}
                    </Typography>

                    {type === 'adGroup' && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>{t('entity_list.dialog.campaign')}</InputLabel>
                            <Select
                                value={selectedCampaign}
                                onChange={(e) => setSelectedCampaign(e.target.value)}
                                label={t('entity_list.dialog.campaign')}
                            >
                                {store.campaigns.map(c => (
                                    <MenuItem key={c.id} value={c.id}>{c.Campaign}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {(type === 'keyword' || type === 'ad') && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>{t('entity_list.dialog.ad_group')}</InputLabel>
                            <Select
                                value={selectedAdGroup}
                                onChange={(e) => setSelectedAdGroup(e.target.value)}
                                label={t('entity_list.dialog.ad_group')}
                            >
                                {store.adGroups.map(ag => (
                                    <MenuItem key={ag.id} value={ag.id}>{ag['Ad Group']} ({ag.Campaign})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAiDialogOpen(false)}>{t('common.cancel')}</Button>
                    <AiAssistButton
                        onGenerate={handleAiGenerate}
                        isGenerating={isGenerating}
                        label={t('common.generate')}
                        variant="contained"
                        placeholder={`e.g., Focus on ${type === 'keyword' ? 'long-tail keywords' : 'mobile users'}...`}
                    />
                </DialogActions>
            </Dialog>

            <Paper sx={{ width: '100%', borderRadius: 2 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    onRowSelectionModelChange={setSelectionModel}
                    rowSelectionModel={selectionModel}
                    onRowDoubleClick={(params) => {
                        if (type === 'ad') {
                            navigate(`/ads/${params.id}`);
                        }
                    }}
                    autosizeOnMount
                    autosizeOptions={{
                        includeHeaders: true,
                        includeOutliers: true,
                        expand: true,
                    }}
                    sx={{ border: 0, cursor: type === 'ad' ? 'pointer' : 'default' }}
                />
            </Paper>
            <ImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />
        </Box>
    );
};

export default EntityListView;

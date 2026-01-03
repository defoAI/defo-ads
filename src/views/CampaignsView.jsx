// File: src/views/CampaignsView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// List view for all campaigns with create functionality and icon-enhanced columns.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import {
    AddCircle as AddIcon,
    Delete as DeleteIcon,
    CheckCircle as EnabledIcon,
    PauseCircle as PausedIcon,
    RemoveCircle as RemovedIcon,
    Search as SearchIcon,
    DisplaySettings as DisplayIcon,
    VideoLibrary as VideoIcon,
    ShoppingCart as ShoppingIcon,
    Explore as DiscoveryIcon,
    RocketLaunch as PMaxIcon,
    CampaignOutlined as EmptyIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import CreateCampaignDialog from '../components/CreateCampaignDialog';
import { trackPageView, trackCampaignDeleted } from '../services/analyticsService';
import EmptyState from '../components/EmptyState';
import { useTranslation } from 'react-i18next';

// Icon mapping for campaign types
const typeIcons = {
    Search: <SearchIcon fontSize="small" />,
    Display: <DisplayIcon fontSize="small" />,
    Video: <VideoIcon fontSize="small" />,
    Shopping: <ShoppingIcon fontSize="small" />,
    Discovery: <DiscoveryIcon fontSize="small" />,
    'Performance Max': <PMaxIcon fontSize="small" />,
};

// Status icon/color mapping
const statusConfig = {
    Enabled: { icon: <EnabledIcon fontSize="small" />, color: 'success' },
    Paused: { icon: <PausedIcon fontSize="small" />, color: 'warning' },
    Removed: { icon: <RemovedIcon fontSize="small" />, color: 'error' },
};

const CampaignsView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { campaigns, deleteCampaigns, sites } = useAdsStore();

    // Track page view
    useEffect(() => {
        trackPageView('campaigns');
    }, []);

    const handleDelete = () => {
        const selectedIds = Array.from(selectionModel.ids);
        if (window.confirm(`${t('common.delete')} ${t('confirmations.delete_campaigns', { count: selectedIds.length })}`)) {
            deleteCampaigns(selectedIds);
            trackCampaignDeleted(selectedIds.length);
            setSelectionModel({ type: 'include', ids: new Set() });
        }
    };

    const rows = campaigns;

    const columns = [
        { field: 'id', headerName: t('campaign.id'), width: 70 },
        { field: 'Campaign', headerName: t('campaign.name'), flex: 1, minWidth: 200 },
        {
            field: 'siteId',
            headerName: t('campaign.site'),
            width: 150,
            renderCell: (params) => {
                if (!params.value) return '—';
                const site = sites.find(s => s.id === params.value);
                return site ? (
                    <Box
                        component="span"
                        title={site.url}
                        onClick={(e) => { e.stopPropagation(); navigate(`/sites/${site.id}`); }}
                        sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                        {site.name}
                    </Box>
                ) : t('common.unknown');
            }
        },
        {
            field: 'Type',
            headerName: t('campaign.type'),
            width: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {typeIcons[params.value] || null}
                    <span>{params.value}</span>
                </Box>
            ),
        },
        {
            field: 'Budget',
            headerName: t('campaign.budget'),
            type: 'number',
            width: 120,
            renderCell: (params) => params.value ? `€${params.value.toFixed(2)}` : '—',
        },
        {
            field: 'Status',
            headerName: t('campaign.status'),
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
        },
    ];

    const handleRowClick = (params) => {
        navigate(`/campaigns/${params.id}`);
    };

    const selectedCount = selectionModel.ids.size;

    // Empty state
    if (rows.length === 0) {
        return (
            <Box sx={{ width: '100%' }}>
                <CreateCampaignDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />

                <EmptyState
                    icon={<EmptyIcon />}
                    title={t('campaign.empty_state.title')}
                    description={t('campaign.empty_state.description')}
                    features={[
                        t('campaign.empty_state.feature_1'),
                        t('campaign.empty_state.feature_2'),
                        t('campaign.empty_state.feature_3')
                    ]}
                    actions={
                        <Button
                            variant="contained"
                            size="large"
                            data-testid="btn-new-campaign"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                                },
                            }}
                        >
                            {t('campaign.actions.create')}
                        </Button>
                    }
                />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <CreateCampaignDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mb: 2
            }}>
                <Typography variant="body2" color="text.secondary">
                    {t('campaign.counts.campaign_count_other', { count: rows.length })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedCount > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            data-testid="btn-delete-selected"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            fullWidth
                        >
                            {t('campaign.actions.delete')} ({selectedCount})
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        data-testid="btn-new-campaign"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                            },
                        }}
                        fullWidth
                    >
                        {t('campaign.actions.new')}
                    </Button>
                </Box>
            </Box>
            <Paper sx={{ width: '100%', borderRadius: 2 }} data-testid="campaigns-grid">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    onRowClick={handleRowClick}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    onRowSelectionModelChange={setSelectionModel}
                    rowSelectionModel={selectionModel}
                    autosizeOnMount
                    autosizeOptions={{
                        includeHeaders: true,
                        includeOutliers: true,
                        expand: true,
                    }}
                    sx={{ cursor: 'pointer', border: 0 }}
                />
            </Paper>
        </Box>
    );
};

export default CampaignsView;


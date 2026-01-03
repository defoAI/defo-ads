// File: src/views/SitesView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// List view for all sites.

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper } from '@mui/material';
import {
    AddCircle as AddIcon,
    Delete as DeleteIcon,
    Language as SiteIcon,
    LanguageOutlined as EmptyIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import CreateSiteDialog from '../components/CreateSiteDialog';
import { useNavigate } from 'react-router-dom';
import { trackPageView, trackSiteDeleted } from '../services/analyticsService';
import EmptyState from '../components/EmptyState';
import CreateCampaignDialog from '../components/CreateCampaignDialog';
import { useTranslation } from 'react-i18next';

const SitesView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
    const [preselectedSiteId, setPreselectedSiteId] = useState(null);
    const { sites, deleteSites } = useAdsStore();

    // Handler to open campaign dialog after site creation
    const handleSiteCreatedGoToCampaign = (siteId) => {
        setPreselectedSiteId(siteId);
        setCampaignDialogOpen(true);
    };

    // Track page view
    useEffect(() => {
        trackPageView('sites');
    }, []);

    const handleDelete = () => {
        const selectedIds = Array.from(selectionModel.ids);
        if (window.confirm(t('confirmations.delete_sites', { count: selectedIds.length }))) {
            deleteSites(selectedIds);
            trackSiteDeleted(selectedIds.length);
            setSelectionModel({ type: 'include', ids: new Set() });
        }
    };

    const rows = sites;

    const columns = [
        { field: 'id', headerName: t('site.id'), width: 70 },
        { field: 'name', headerName: t('site.name'), flex: 1, minWidth: 150 },
        { field: 'url', headerName: t('site.url'), flex: 1, minWidth: 200 },
    ];

    const selectedCount = selectionModel.ids.size;

    // Empty state
    if (rows.length === 0) {
        return (
            <Box sx={{ width: '100%' }}>
                <CreateSiteDialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    onCreateCampaign={handleSiteCreatedGoToCampaign}
                />
                <CreateCampaignDialog
                    open={campaignDialogOpen}
                    onClose={() => {
                        setCampaignDialogOpen(false);
                        setPreselectedSiteId(null);
                    }}
                />

                <EmptyState
                    icon={<EmptyIcon />}
                    title={t('site.empty_state.title')}
                    description={t('site.empty_state.description')}
                    features={[
                        t('site.empty_state.feature_1'),
                        t('site.empty_state.feature_2'),
                        t('site.empty_state.feature_3')
                    ]}
                    actions={
                        <Button
                            variant="contained"
                            size="large"
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
                            {t('site.actions.create')}
                        </Button>
                    }
                />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <CreateSiteDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreateCampaign={handleSiteCreatedGoToCampaign}
            />
            <CreateCampaignDialog
                open={campaignDialogOpen}
                onClose={() => {
                    setCampaignDialogOpen(false);
                    setPreselectedSiteId(null);
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('site.counts.site_count_other', { count: rows.length })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedCount > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                        >
                            {t('site.actions.delete')} ({selectedCount})
                        </Button>
                    )}
                    <Button
                        variant="contained"
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
                        {t('site.actions.new')}
                    </Button>
                </Box>
            </Box>
            <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    onRowSelectionModelChange={setSelectionModel}
                    rowSelectionModel={selectionModel}
                    onRowDoubleClick={(params) => navigate(`/sites/${params.id}`)}
                    autosizeOnMount
                    autosizeOptions={{
                        includeHeaders: true,
                        includeOutliers: true,
                    }}
                    sx={{ border: 0 }}
                />
            </Paper>
        </Box>
    );
};

export default SitesView;

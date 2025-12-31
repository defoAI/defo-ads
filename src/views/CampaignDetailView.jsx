// File: src/views/CampaignDetailView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Detail view for a single campaign, with tabs for different sections including JSON.

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Chip,
} from '@mui/material';
import { ArrowBack, Edit, Save, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Tab Components
import CampaignGeneralTab from './CampaignDetail/CampaignGeneralTab';
import CampaignAdGroupsTab from './CampaignDetail/CampaignAdGroupsTab';
import CampaignKeywordsTab from './CampaignDetail/CampaignKeywordsTab';
import CampaignAdsTab from './CampaignDetail/CampaignAdsTab';
import CampaignJsonTab from './CampaignDetail/CampaignJsonTab';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const CampaignDetailView = () => {
    const { t } = useTranslation();
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(false);

    // Mock campaign data
    const campaign = {
        id: campaignId,
        Campaign: `Campaign #${campaignId}`,
        Budget: 50.00,
        Status: 'Enabled',
        Type: 'Search',
        Networks: 'Google search;Search Partners',
        Languages: 'en',
    };

    const jsonData = JSON.stringify(campaign, null, 2);

    return (
        <Box>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/campaigns')}
                sx={{ mb: 2 }}
                size="small"
            >
                {t('navigation.back_to_campaigns')}
            </Button>

            <Paper sx={{ mt: 1 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                {campaign.Campaign}
                            </Typography>
                            <Chip
                                label={campaign.Status}
                                color={campaign.Status === 'Enabled' ? 'success' : 'default'}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        </Box>
                        <Box>
                            {!editMode ? (
                                <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)} size="small">
                                    {t('common.edit')}
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditMode(false)} size="small" sx={{ mr: 1 }}>
                                        {t('common.cancel')}
                                    </Button>
                                    <Button variant="contained" startIcon={<Save />} size="small">
                                        {t('common.save')}
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                        <Tab label={t('tabs.general')} />
                        <Tab label={t('tabs.ad_groups')} />
                        <Tab label={t('tabs.keywords')} />
                        <Tab label={t('tabs.ads')} />
                        <Tab label={t('tabs.json')} />
                    </Tabs>
                </Box>

                {/* General Tab */}
                <TabPanel value={activeTab} index={0}>
                    <CampaignGeneralTab
                        campaign={campaign}
                        editMode={editMode}
                    />
                </TabPanel>

                {/* Ad Groups Tab */}
                <TabPanel value={activeTab} index={1}>
                    <CampaignAdGroupsTab
                        campaignId={campaignId}
                    />
                </TabPanel>

                {/* Keywords Tab */}
                <TabPanel value={activeTab} index={2}>
                    <CampaignKeywordsTab />
                </TabPanel>

                {/* Ads Tab */}
                <TabPanel value={activeTab} index={3}>
                    <CampaignAdsTab />
                </TabPanel>

                {/* JSON Tab */}
                <TabPanel value={activeTab} index={4}>
                    <CampaignJsonTab
                        jsonData={jsonData}
                        editMode={editMode}
                    />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default CampaignDetailView;

// File: src/views/AdGroupDetailView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Detail view for an ad group, accessible via /campaigns/:campaignId/adgroups/:adGroupId

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
import AdGroupGeneralTab from './AdGroupDetail/AdGroupGeneralTab';
import AdGroupKeywordsTab from './AdGroupDetail/AdGroupKeywordsTab';
import AdGroupAdsTab from './AdGroupDetail/AdGroupAdsTab';
import AdGroupJsonTab from './AdGroupDetail/AdGroupJsonTab';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const AdGroupDetailView = () => {
    const { t } = useTranslation();
    const { campaignId, adGroupId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(false);

    // Mock ad group data
    const adGroup = {
        id: adGroupId,
        name: `Ad Group #${adGroupId}`,
        campaignId: campaignId,
        maxCpc: 0.50,
        status: 'Enabled',
        type: 'Standard',
    };

    const jsonData = JSON.stringify(adGroup, null, 2);

    return (
        <Box>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/campaigns/${campaignId}`)}
                sx={{ mb: 2 }}
                size="small"
            >
                {t('navigation.back_to_campaign')}
            </Button>

            <Paper sx={{ mt: 1 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                {adGroup.name}
                            </Typography>
                            <Chip
                                label={adGroup.status}
                                color={adGroup.status === 'Enabled' ? 'success' : 'default'}
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
                        <Tab label={t('tabs.keywords')} />
                        <Tab label={t('tabs.ads')} />
                        <Tab label={t('tabs.json')} />
                    </Tabs>
                </Box>

                {/* General Tab */}
                <TabPanel value={activeTab} index={0}>
                    <AdGroupGeneralTab
                        adGroup={adGroup}
                        editMode={editMode}
                    />
                </TabPanel>

                {/* Keywords Tab */}
                <TabPanel value={activeTab} index={1}>
                    <AdGroupKeywordsTab />
                </TabPanel>

                {/* Ads Tab */}
                <TabPanel value={activeTab} index={2}>
                    <AdGroupAdsTab />
                </TabPanel>

                {/* JSON Tab */}
                <TabPanel value={activeTab} index={3}>
                    <AdGroupJsonTab
                        jsonData={jsonData}
                        editMode={editMode}
                    />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default AdGroupDetailView;

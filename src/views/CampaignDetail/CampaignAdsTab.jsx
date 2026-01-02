// File: src/views/CampaignDetail/CampaignAdsTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Campaign ads listing tab component.

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CampaignAdsTab = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">{t('campaign_ads.description')}</Typography>
        </Box>
    );
};

export default CampaignAdsTab;

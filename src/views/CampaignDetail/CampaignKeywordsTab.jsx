// File: src/views/CampaignDetail/CampaignKeywordsTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Campaign keywords listing tab component.

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CampaignKeywordsTab = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            {/* Mocking contextual keyword view for now, usually needs Ad Group selection first or flatten list */}
            <Typography color="text.secondary">{t('campaign_keywords.select_ad_group')}</Typography>
        </Box>
    );
};

export default CampaignKeywordsTab;

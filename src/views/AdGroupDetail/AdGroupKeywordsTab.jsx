// File: src/views/AdGroupDetail/AdGroupKeywordsTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Ad group keywords listing tab component.

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AdGroupKeywordsTab = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">{t('ad_group_keywords.description')}</Typography>
        </Box>
    );
};

export default AdGroupKeywordsTab;

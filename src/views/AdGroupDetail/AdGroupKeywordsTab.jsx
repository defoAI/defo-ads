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

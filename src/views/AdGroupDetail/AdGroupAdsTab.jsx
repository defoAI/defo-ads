import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AdGroupAdsTab = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">{t('ad_group_ads.description')}</Typography>
        </Box>
    );
};

export default AdGroupAdsTab;

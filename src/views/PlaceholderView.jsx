// File: src/views/PlaceholderView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Placeholder view for sections not yet fully implemented.

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PlaceholderView = ({ title }) => {
    const { t } = useTranslation();
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {t('placeholder.description', { type: title.toLowerCase() })}
            </Typography>
        </Paper>
    );
};

export default PlaceholderView;

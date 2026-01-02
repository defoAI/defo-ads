// File: src/views/AdDetail/AdPreviewTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Google Ads-style preview rendering for responsive search ads.

import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import { Visibility as PreviewIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AdPreviewTab = ({ adData, sitelinks }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PreviewIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_preview.title')}</Typography>
            </Box>

            <Card sx={{ maxWidth: 600, border: '1px solid', borderColor: 'divider', boxShadow: 2 }}>
                <CardContent>
                    <Typography variant="caption" color="text.secondary">
                        Ad · {adData['Final URL'] ? new URL(adData['Final URL']).hostname : 'example.com'}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#1a0dab',
                            fontWeight: 400,
                            fontSize: '18px',
                            lineHeight: 1.3,
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {adData['Headline 1']} | {adData['Headline 2']} | {adData['Headline 3']}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 2 }}>
                        {adData['Description 1']} {adData['Description 2']}
                    </Typography>

                    {/* Sitelinks Preview */}
                    {sitelinks.length > 0 && (
                        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Grid container spacing={1}>
                                {sitelinks.slice(0, 4).map((link, i) => (
                                    <Grid item xs={6} key={i}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#1a0dab',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {link.text || `Sitelink ${i + 1}`}
                                        </Typography>
                                        {(link.description1 || link.description2) && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                                                {link.description1} {link.description2}
                                            </Typography>
                                        )}
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                {t('ad_preview.description')}
            </Typography>
        </Box>
    );
};

export default AdPreviewTab;

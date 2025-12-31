// File: src/components/CookieConsent.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Modern cookie consent banner for GDPR compliance

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Fade,
    Stack,
} from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';
import {
    isAnalyticsEnabled,
    getConsentPreference,
    setConsentPreference,
    initializeAnalytics,
} from '../firebase';
import { useTranslation } from 'react-i18next';

const CookieConsent = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show banner in production builds
        if (!isAnalyticsEnabled()) {
            return;
        }

        // Check if user has already made a choice
        const consent = getConsentPreference();
        if (consent === null) {
            // No choice made yet, show banner
            setVisible(true);
        } else if (consent === 'accepted') {
            // User already accepted, initialize analytics
            initializeAnalytics();
        }
    }, []);

    const handleAccept = () => {
        setConsentPreference('accepted');
        initializeAnalytics();
        setVisible(false);
    };

    const handleDecline = () => {
        setConsentPreference('declined');
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <Fade in={visible} timeout={500}>
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    maxWidth: 480,
                    width: 'calc(100% - 48px)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    // Glassmorphism effect
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.85)'
                            : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: (theme) =>
                        `1px solid ${theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)'
                        }`,
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                            : '0 8px 32px rgba(0, 0, 0, 0.12)',
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <CookieIcon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    mb: 0.5,
                                    color: 'text.primary',
                                }}
                            >
                                {t('cookie_consent.title')}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    lineHeight: 1.6,
                                }}
                            >
                                {t('cookie_consent.description')}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ mt: 2.5, justifyContent: 'flex-end' }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleDecline}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2.5,
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.2)'
                                        : 'rgba(0, 0, 0, 0.15)',
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.3)'
                                            : 'rgba(0, 0, 0, 0.25)',
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.03)',
                                },
                            }}
                        >
                            {t('cookie_consent.decline')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAccept}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2.5,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.45)',
                                },
                            }}
                        >
                            {t('cookie_consent.accept')}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Fade>
    );
};

export default CookieConsent;

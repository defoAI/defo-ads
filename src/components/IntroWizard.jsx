// File: src/components/IntroWizard.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Modal wizard for new user onboarding.
// Handles: Welcome, Terms Acceptance, OpenAI Key setup, and Backup reminders.

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Link,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    Key as KeyIcon,
    CloudDownload as BackupIcon,
    NavigateNext,
    NavigateBefore,
    Check as CheckIcon,
    Close as CloseIcon,
    Gavel as TermsIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { trackOnboardingStep, trackOnboardingComplete, trackTermsAccepted } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

const IntroWizard = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [apiKey, setApiKey] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const steps = [
        t('intro_wizard.steps.welcome'),
        t('intro_wizard.steps.terms'),
        t('intro_wizard.steps.api_setup'),
        t('intro_wizard.steps.safety_first')
    ];

    useEffect(() => {
        if (open) {
            // Pre-fill existing key if available
            const storedKey = localStorage.getItem('openai_api_key');
            if (storedKey) setApiKey(storedKey);
        }
    }, [open]);

    const canProceed = () => {
        if (activeStep === 1) {
            return termsAccepted;
        }
        return true;
    };

    const handleNext = () => {
        if (activeStep === 1 && termsAccepted) {
            // Track terms acceptance
            trackTermsAccepted();
        }

        if (activeStep === 2) {
            // Save API key on leaving API step
            if (apiKey.trim()) {
                localStorage.setItem('openai_api_key', apiKey.trim());
            }
        }

        if (activeStep === steps.length - 1) {
            handleFinish();
        } else {
            const nextStep = activeStep + 1;
            setActiveStep(nextStep);
            trackOnboardingStep(nextStep + 1); // 1-indexed for analytics
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleFinish = () => {
        localStorage.setItem('hasSeenIntro', 'true');
        localStorage.setItem('termsAccepted', 'true');
        trackOnboardingComplete();
        onClose();
    };

    // Render content based on active step
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Defo Ads"
                            sx={{ maxWidth: 200, height: 'auto', mb: 2 }}
                        />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t('intro_wizard.welcome.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {t('intro_wizard.welcome.description')}
                        </Typography>
                        <Box sx={{
                            my: 3,
                            p: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('intro_wizard.welcome.privacy_title')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('intro_wizard.welcome.privacy_description')}
                            </Typography>
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <TermsIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t('intro_wizard.terms.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {t('intro_wizard.terms.description')}
                        </Typography>

                        <Box sx={{
                            my: 2,
                            p: 2,
                            maxHeight: 200,
                            overflow: 'auto',
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            textAlign: 'left'
                        }}>
                            <Typography variant="body2" color="text.secondary" component="div">
                                <strong>{t('intro_wizard.terms.key_points')}</strong>
                                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                    <li>{t('intro_wizard.terms.point_1')}</li>
                                    <li>{t('intro_wizard.terms.point_2')}</li>
                                    <li>{t('intro_wizard.terms.point_3')}</li>
                                    <li>{t('intro_wizard.terms.point_4')}</li>
                                    <li>{t('intro_wizard.terms.point_5')}</li>
                                </ul>
                            </Typography>
                            <Link href="/terms.md" target="_blank" rel="noopener">
                                {t('intro_wizard.terms.read_full')}
                            </Link>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {t('intro_wizard.terms.accept')}
                                </Typography>
                            }
                            sx={{ mt: 1 }}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <KeyIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t('intro_wizard.api_setup.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {t('intro_wizard.api_setup.description')}
                        </Typography>

                        <TextField
                            fullWidth
                            label={t('intro_wizard.api_setup.openai_key')}
                            variant="outlined"
                            placeholder={t('intro_wizard.api_setup.key_placeholder')}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            type="password"
                            sx={{ mt: 2, mb: 1 }}
                            helperText={t('intro_wizard.api_setup.key_helper')}
                        />

                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {t('intro_wizard.api_setup.get_key')}
                        </Typography>
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <BackupIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t('intro_wizard.safety_first.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {t('intro_wizard.safety_first.description')}
                        </Typography>

                        <Box sx={{
                            my: 3,
                            p: 2,
                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.warning.main, 0.2)
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                                {t('intro_wizard.safety_first.warning_title')}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {t('intro_wizard.safety_first.warning_description')}
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: '550px',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                {/* Optional close button - but for terms we should discourage skipping */}
                {activeStep !== 1 && (
                    <IconButton onClick={handleFinish} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderStepContent(activeStep)}
            </DialogContent>

            <Box sx={{ px: 3, pb: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <DialogActions sx={{ justifyContent: 'space-between', p: 0 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBefore />}
                    >
                        {t('intro_wizard.actions.back')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!canProceed()}
                        endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <NavigateNext />}
                        size="large"
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {activeStep === steps.length - 1 ? t('intro_wizard.actions.get_started') : t('intro_wizard.actions.next')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default IntroWizard;

// File: src/views/SettingsView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Settings view for API key configuration and data management.

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    Divider,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Save as SaveIcon,
    Settings as SettingsIcon,
    Terminal as PromptIcon,
    DeleteForever as ClearIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import PromptEditor from '../components/PromptEditor';
import ImprintView from './ImprintView';
import { useAdsStore } from '../store/useAdsStore';
import { trackPageView, trackApiKeySaved, trackSettingChanged, trackDataCleared } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

const SettingsView = () => {
    const { t } = useTranslation();
    const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('openai_api_key') || '');
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [cleared, setCleared] = useState(false);

    const store = useAdsStore();

    // Track page view
    useEffect(() => {
        trackPageView('settings');
    }, []);

    const handleSave = () => {
        localStorage.setItem('openai_api_key', openaiKey);
        trackApiKeySaved();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleClearData = () => {
        // Preserve the OpenAI API key
        const apiKey = localStorage.getItem('openai_api_key');
        const termsAccepted = localStorage.getItem('termsAccepted');
        const hasSeenIntro = localStorage.getItem('hasSeenIntro');

        // Reset the store (clears all entities)
        store.setSites([]);
        store.setCampaigns([]);
        store.setAdGroups([]);
        store.setKeywords([]);
        store.setAds([]);
        store.resetPrompts();

        // Clear localStorage ads-store but preserve key settings
        localStorage.removeItem('ads-store');

        // Restore preserved items
        if (apiKey) localStorage.setItem('openai_api_key', apiKey);
        if (termsAccepted) localStorage.setItem('termsAccepted', termsAccepted);
        if (hasSeenIntro) localStorage.setItem('hasSeenIntro', hasSeenIntro);

        setClearDialogOpen(false);
        trackDataCleared();
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
    };

    return (
        <Box>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {t('settings.title')}
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
                        <Tab icon={<SettingsIcon />} iconPosition="start" label={t('settings.tabs.general')} />
                        <Tab icon={<PromptIcon />} iconPosition="start" label={t('settings.tabs.prompts')} />
                        <Tab icon={<InfoIcon />} iconPosition="start" label={t('settings.tabs.imprint')} />
                    </Tabs>
                </Box>

                {/* Tab 0: General (API Keys + Data Management) */}
                {activeTab === 0 && (
                    <Box sx={{ animation: 'fadeIn 0.3s' }}>
                        <Typography variant="h6" gutterBottom>
                            {t('settings.api.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {t('settings.api.description')}
                        </Typography>

                        <Box sx={{ maxWidth: 500 }}>
                            <TextField
                                fullWidth
                                label={t('settings.api.openai_key_label')}
                                type="password"
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                helperText={t('settings.api.openai_key_helper')}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                            >
                                {t('settings.api.save')}
                            </Button>

                            {saved && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {t('settings.api.saved')}
                                </Alert>
                            )}
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* AI Behavior Section */}
                        <Typography variant="h6" gutterBottom>
                            {t('settings.ai_behavior.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('settings.ai_behavior.description')}
                        </Typography>

                        <Box sx={{ maxWidth: 500, mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={store.settings?.askForCustomInstructions ?? false}
                                        onChange={(e) => {
                                            store.setSetting('askForCustomInstructions', e.target.checked);
                                            trackSettingChanged('askForCustomInstructions', e.target.checked);
                                        }}
                                        color="primary"
                                    />
                                }
                                label={t('settings.ai_behavior.custom_instructions_label')}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4.5 }}>
                                {t('settings.ai_behavior.custom_instructions_helper')}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Data Management Section */}
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ClearIcon color="error" /> {t('settings.data_management.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {t('settings.data_management.description')}
                        </Typography>

                        <Box sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'error.light',
                            borderRadius: 2,
                            bgcolor: 'error.50',
                            maxWidth: 500,
                        }}>
                            <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon fontSize="small" /> {t('settings.data_management.danger_zone')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('settings.data_management.warning')}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ClearIcon />}
                                onClick={() => setClearDialogOpen(true)}
                            >
                                {t('settings.data_management.clear_all')}
                            </Button>

                            {cleared && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {t('settings.data_management.cleared')}
                                </Alert>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Tab 1: Prompts */}
                {activeTab === 1 && (
                    <Box sx={{ animation: 'fadeIn 0.3s' }}>
                        <Typography variant="h6" gutterBottom>
                            {t('settings.prompts.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {t('settings.prompts.description')}
                        </Typography>

                        <PromptEditor />
                    </Box>
                )}

                {/* Tab 2: Imprint */}
                {activeTab === 2 && (
                    <Box sx={{ animation: 'fadeIn 0.3s' }}>
                        <ImprintView />
                    </Box>
                )}
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => setClearDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClearIcon color="error" /> {t('settings.dialog.clear_title')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('settings.dialog.clear_description')}
                        <ul style={{ marginTop: 8, marginBottom: 0 }}>
                            <li>{t('settings.dialog.clear_item_sites')}</li>
                            <li>{t('settings.dialog.clear_item_campaigns')}</li>
                            <li>{t('settings.dialog.clear_item_adgroups')}</li>
                            <li>{t('settings.dialog.clear_item_keywords')}</li>
                            <li>{t('settings.dialog.clear_item_ads')}</li>
                        </ul>
                    </DialogContentText>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {t('settings.dialog.preserved_notice')}
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setClearDialogOpen(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleClearData}
                        variant="contained"
                        color="error"
                        startIcon={<ClearIcon />}
                    >
                        {t('settings.dialog.confirm_clear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsView;


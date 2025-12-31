// File: src/components/PromptEditor.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Component for editing AI prompt templates.

import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    Chip,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { Save as SaveIcon, Restore as ResetIcon } from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { useTranslation } from 'react-i18next';

const PromptEditor = () => {
    const { t } = useTranslation();
    const { prompts, savePrompt, resetPrompts } = useAdsStore();
    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const contextTypes = [
        { value: 'campaign', label: 'Campaign Creation' },
        { value: 'site', label: 'Site Analysis' },
        { value: 'ad', label: 'Ad Copy Generation' },
    ];

    // Select the first prompt by default if available
    useEffect(() => {
        if (!selectedPromptId && prompts.length > 0) {
            handleSelectPrompt(prompts[0].id);
        }
    }, [prompts]);

    const handleSelectPrompt = (id) => {
        const prompt = prompts.find(p => p.id === id);
        if (prompt) {
            setSelectedPromptId(id);
            setTemplateContent(prompt.template);
        }
    };

    const handleSave = () => {
        const prompt = prompts.find(p => p.id === selectedPromptId);
        if (prompt) {
            savePrompt({ ...prompt, template: templateContent });
            setSuccessMessage(t('prompt_editor.saved'));
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleReset = () => {
        if (window.confirm(t('prompt_editor.reset_confirm'))) {
            resetPrompts();
            // Re-select the current one to refresh view
            const defaultP = prompts.find(p => p.id === selectedPromptId); // This might be stale until next render, but effect will catch up or we force it:
            // Actually, we best let the store update trigger a re-read/effect.
            setSuccessMessage(t('prompt_editor.reset_success'));
        }
    };

    const activePrompt = prompts.find(p => p.id === selectedPromptId);

    const insertPlaceholder = (ph) => {
        setTemplateContent(prev => prev + ' ' + ph);
    };

    if (prompts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>{t('prompt_editor.no_prompts')}</Typography>
                <Button onClick={resetPrompts} sx={{ mt: 2 }}>{t('prompt_editor.initialize_defaults')}</Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel id="prompt-select-label">{t('prompt_editor.select_template')}</InputLabel>
                    <Select
                        labelId="prompt-select-label"
                        value={selectedPromptId}
                        label={t('prompt_editor.select_template')}
                        onChange={(e) => handleSelectPrompt(e.target.value)}
                    >
                        {prompts.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleReset}
                    startIcon={<ResetIcon />}
                    sx={{ minWidth: 120 }}
                >
                    {t('prompt_editor.defaults')}
                </Button>
            </Box>

            {activePrompt && (
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        {activePrompt.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
                            {t('prompt_editor.available_placeholders')}:
                        </Typography>
                        {activePrompt.placeholders?.map(ph => (
                            <Chip
                                key={ph}
                                label={ph}
                                size="small"
                                onClick={() => insertPlaceholder(ph)}
                                sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
                            />
                        ))}
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        minRows={10}
                        maxRows={25}
                        value={templateContent}
                        onChange={(e) => setTemplateContent(e.target.value)}
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                        {successMessage && <Alert severity="success" sx={{ py: 0, px: 2 }}>{successMessage}</Alert>}
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                        >
                            {t('prompt_editor.save_template')}
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default PromptEditor;

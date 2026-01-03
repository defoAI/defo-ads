// File: src/components/AiAssistButton.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Reusable button component that opens a popover for custom AI instructions
// before triggering the generation action.
// Now includes friendly API key missing guidance.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Popover,
    Box,
    TextField,
    Typography,
    IconButton,
    Link,
} from '@mui/material';
import {
    AutoAwesome as AiIcon,
    Close as CloseIcon,
    Key as KeyIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { useTranslation } from 'react-i18next';

const AiAssistButton = ({
    onGenerate, // async function(instructions)
    isGenerating = false,
    label = "Analyze with AI",
    icon = <AiIcon />,
    disabled = false,
    variant = "contained",
    fullWidth = false,
    size = "medium",
    placeholder = "e.g., Focus on eco-friendly aspects..."
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

    const askForCustomInstructions = useAdsStore((state) => state.settings?.askForCustomInstructions ?? false);
    const useServerAI = useAdsStore((state) => state.settings?.useServerAI ?? false);

    const checkApiKey = () => {
        // If Server AI is enabled, we assume the backend handles auth/limits
        if (useServerAI) return true;

        const apiKey = localStorage.getItem('openai_api_key');
        return apiKey && apiKey.trim().length > 0;
    };

    const handleClick = async (event) => {
        if (!checkApiKey()) {
            setShowApiKeyPrompt(true);
            setAnchorEl(event.currentTarget);
        } else if (askForCustomInstructions) {
            // Show popover for custom instructions
            setShowApiKeyPrompt(false);
            setAnchorEl(event.currentTarget);
        } else {
            // Skip popover and generate directly
            if (onGenerate) {
                await onGenerate('');
            }
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setShowApiKeyPrompt(false);
    };

    const handleGoToSettings = () => {
        handleClose();
        navigate('/settings');
    };

    const handleGenerate = async () => {
        if (onGenerate) {
            handleClose();
            await onGenerate(instructions);
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'ai-assist-popover' : undefined;

    return (
        <>
            <Button
                variant={variant}
                startIcon={icon}
                onClick={handleClick}
                disabled={disabled || isGenerating}
                fullWidth={fullWidth}
                size={size}
                sx={variant === 'contained' ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.35)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                        boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.45)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s ease-in-out',
                } : {
                    color: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                        borderColor: '#5568d3',
                        borderStyle: 'solid',
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s ease-in-out',
                }}
            >
                {isGenerating ? t('common.loading') : label}
            </Button>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { width: 340, p: 2.5, borderRadius: 2 }
                }}
            >
                {showApiKeyPrompt ? (
                    // API Key Missing View
                    <Box sx={{ textAlign: 'center' }}>
                        <KeyIcon sx={{ fontSize: 48, color: '#667eea', mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('ai_assist.api_key_required')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('ai_assist.api_key_description')}
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SettingsIcon />}
                            onClick={handleGoToSettings}
                            sx={{
                                mb: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.2,
                            }}
                        >
                            {t('ai_assist.go_to_settings')}
                        </Button>

                        <Typography variant="caption" color="text.secondary">
                            {t('ai_assist.no_key')}{' '}
                            <Link
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener"
                                sx={{ color: '#667eea' }}
                            >
                                {t('ai_assist.get_key')}
                            </Link>
                        </Typography>
                    </Box>
                ) : (
                    // Normal Instructions View
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#667eea' }}>
                                <AiIcon fontSize="small" /> {t('ai_assist.custom_instructions')}
                            </Typography>
                            <IconButton size="small" onClick={handleClose}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </div>

                        <Typography variant="caption" color="text.secondary" paragraph sx={{ mb: 2 }}>
                            {t('ai_assist.instructions_description')}
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                            placeholder={placeholder}
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#667eea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    },
                                }
                            }}
                            autoFocus
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            startIcon={<AiIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.2,
                                boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                                    boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.45)',
                                }
                            }}
                        >
                            {t('common.generate')}
                        </Button>
                    </>
                )}
            </Popover>
        </>
    );
};

export default AiAssistButton;

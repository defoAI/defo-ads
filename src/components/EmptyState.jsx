// File: src/components/EmptyState.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Reusable empty state component with consistent styling for list views.

import React from 'react';
import { Box, Typography, Paper, Avatar, alpha, useTheme } from '@mui/material';

/**
 * A reusable empty state component with consistent styling.
 * 
 * @param {React.ReactNode} icon - The icon component to display (should be large).
 * @param {string} title - The main heading text.
 * @param {string} description - The secondary description text.
 * @param {React.ReactNode} actions - Optional buttons or actions to display below the text.
 */
const EmptyState = ({ icon, title, description, features, actions }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                width: '100%',
            }}
        >
            <Avatar
                sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mx: 'auto',
                    mb: 3,
                    '& > svg': { fontSize: 40 }
                }}
            >
                {icon}
            </Avatar>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
                {description}
            </Typography>

            {features && features.length > 0 && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    maxWidth: 400,
                    mx: 'auto',
                    mb: 4,
                    gap: 1.5,
                    textAlign: 'left'
                }}>
                    {features.map((feature, index) => (
                        <Box key={index} sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            width: '100%',
                            textAlign: 'left'
                        }}>
                            <Box
                                component="span"
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                    mt: 0.75,
                                }}
                            />
                            <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                    flex: 1,
                                    lineHeight: 1.5,
                                    textAlign: 'left'
                                }}
                            >
                                {feature}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {actions && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {actions}
                </Box>
            )}
        </Paper>
    );
};

export default EmptyState;


import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * A reusable empty state component with consistent styling.
 * 
 * @param {React.ReactNode} icon - The icon component to display (should be large).
 * @param {string} title - The main heading text.
 * @param {string} description - The secondary description text.
 * @param {React.ReactNode} actions - Optional buttons or actions to display below the text.
 */
const EmptyState = ({ icon, title, description, features, actions }) => {
    return (
        <Paper
            sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(66,165,245,0.02) 100%)',
                width: '100%',
            }}
        >
            <Box sx={{ mb: 2, '& > svg': { fontSize: 80, color: 'primary.main', opacity: 0.6 } }}>
                {icon}
            </Box>
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
                    textAlign: 'left' // Override parent's center alignment
                }}>
                    {features.map((feature, index) => (
                        <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 1.5,
                            width: '100%',
                            textAlign: 'left' // Ensure left alignment
                        }}>
                            <Box
                                component="span"
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                    mt: 0.5, // Slight top margin to align with first line of text
                                }}
                            />
                            <Typography 
                                variant="body2" 
                                color="text.primary"
                                sx={{
                                    flex: 1,
                                    lineHeight: 1.5,
                                    textAlign: 'left' // Explicitly set left alignment
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

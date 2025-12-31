import React from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    Title as HeadlineIcon,
    Description as DescriptionIcon,
    Settings as SettingsIcon,
    Article as AdIcon,
    CheckCircle as EnabledIcon,
    PauseCircle as PausedIcon,
    OpenInNew as OpenIcon,
} from '@mui/icons-material';

const AdEditTab = ({ adData, handleFieldChange }) => {
    const { t } = useTranslation();
    const getCharColor = (current, max) => {
        const ratio = current / max;
        if (ratio >= 1) return 'error.main';
        if (ratio >= 0.8) return 'warning.main';
        return 'text.secondary';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Headlines Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HeadlineIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_detail.headlines')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('ad_detail.headline_max')}</Typography>
            </Box>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[1, 2, 3].map((num) => (
                    <Grid item xs={12} md={4} key={num}>
                        <TextField
                            fullWidth
                            label={t('ad_detail.fields.headline', { num })}
                            value={adData[`Headline ${num}`] || ''}
                            onChange={(e) => handleFieldChange(`Headline ${num}`, e.target.value)}
                            inputProps={{ maxLength: 30 }}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{ color: getCharColor((adData[`Headline ${num}`] || '').length, 30) }}
                                >
                                    {(adData[`Headline ${num}`] || '').length}/30
                                </Typography>
                            }
                        />
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Descriptions Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_detail.descriptions')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('ad_detail.description_max')}</Typography>
            </Box>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[1, 2].map((num) => (
                    <Grid item xs={12} md={6} key={num}>
                        <TextField
                            fullWidth
                            label={t('ad_detail.fields.description', { num })}
                            value={adData[`Description ${num}`] || ''}
                            onChange={(e) => handleFieldChange(`Description ${num}`, e.target.value)}
                            multiline
                            rows={3}
                            inputProps={{ maxLength: 90 }}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{ color: getCharColor((adData[`Description ${num}`] || '').length, 90) }}
                                >
                                    {(adData[`Description ${num}`] || '').length}/90
                                </Typography>
                            }
                        />
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Settings Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_detail.settings')}</Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label={t('ad_detail.fields.ad_group')}
                        value={adData['Ad Group'] || ''}
                        disabled
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AdIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>{t('ad_detail.fields.status')}</InputLabel>
                        <Select
                            value={adData.Status || 'Paused'}
                            label={t('ad_detail.fields.status')}
                            onChange={(e) => handleFieldChange('Status', e.target.value)}
                        >
                            <MenuItem value="Enabled">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EnabledIcon fontSize="small" color="success" /> {t('ad_detail.status.enabled')}
                                </Box>
                            </MenuItem>
                            <MenuItem value="Paused">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PausedIcon fontSize="small" color="warning" /> {t('ad_detail.status.paused')}
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label={t('ad_detail.fields.final_url')}
                        value={adData['Final URL'] || ''}
                        onChange={(e) => handleFieldChange('Final URL', e.target.value)}
                        InputProps={{
                            endAdornment: adData['Final URL'] && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => window.open(adData['Final URL'], '_blank')}
                                    >
                                        <OpenIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdEditTab;

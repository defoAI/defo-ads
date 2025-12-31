import React from 'react';
import {
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Card,
    CardContent,
    Divider,
    Button,
} from '@mui/material';
import {
    Translate as TranslateIcon,
    Title as HeadlineIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import AiAssistButton from '../../components/AiAssistButton';
import { useTranslation } from 'react-i18next';

const AdTranslateTab = ({
    targetLanguage,
    onTargetLanguageChange,
    languages,
    onTranslate,
    isTranslating,
    translatedAd,
    onApply,
}) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TranslateIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_translate.title')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('ad_translate.description')}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>{t('ad_translate.target_language')}</InputLabel>
                        <Select
                            value={targetLanguage}
                            label={t('ad_translate.target_language')}
                            onChange={(e) => onTargetLanguageChange(e.target.value)}
                        >
                            {languages.map(lang => (
                                <MenuItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
                    <AiAssistButton
                        onGenerate={onTranslate}
                        isGenerating={isTranslating}
                        label={t('ad_translate.translate_button')}
                        variant="contained"
                        placeholder="e.g., Keep the tone formal, localize for German market..."
                    />
                </Grid>
            </Grid>

            {translatedAd && (
                <Box sx={{ mt: 3 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {t('ad_translate.translation_complete')}
                    </Alert>

                    <Card sx={{ mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <HeadlineIcon fontSize="small" color="success" />
                                <Typography variant="subtitle2">{t('ad_translate.translated_headlines')}</Typography>
                            </Box>
                            <Typography variant="body2">1: {translatedAd['Headline 1']}</Typography>
                            <Typography variant="body2">2: {translatedAd['Headline 2']}</Typography>
                            <Typography variant="body2">3: {translatedAd['Headline 3']}</Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <DescriptionIcon fontSize="small" color="success" />
                                <Typography variant="subtitle2">{t('ad_translate.translated_descriptions')}</Typography>
                            </Box>
                            <Typography variant="body2">1: {translatedAd['Description 1']}</Typography>
                            <Typography variant="body2">2: {translatedAd['Description 2']}</Typography>
                        </CardContent>
                    </Card>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={onApply}
                        startIcon={<TranslateIcon />}
                        size="large"
                    >
                        {t('ad_translate.apply_translation')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AdTranslateTab;

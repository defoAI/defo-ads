// File: src/views/AdDetail/AdReviewTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// AI-powered ad review tab with scoring and improvement suggestions.

import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
} from '@mui/material';
import {
    RateReview as ReviewIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Lightbulb as SuggestionIcon,
    AutoFixHigh as ImproveIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Star rating component
const StarRating = ({ score, max = 10 }) => {
    const stars = Math.round(score / 2); // Convert 10-point to 5-star
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                star <= stars ? (
                    <StarIcon key={star} sx={{ color: 'warning.main', fontSize: 20 }} />
                ) : (
                    <StarBorderIcon key={star} sx={{ color: 'warning.main', fontSize: 20 }} />
                )
            ))}
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                {score}/10
            </Typography>
        </Box>
    );
};

const AdReviewTab = ({
    isReviewing,
    onReview,
    adReview,
    isApplyingImprovement,
    onApplyImprovement,
}) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReviewIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('ad_review.title')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('ad_review.description')}
            </Typography>

            {/* Generate Review Button */}
            <Box sx={{ mb: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={isReviewing ? null : <ReviewIcon />}
                    onClick={onReview}
                    disabled={isReviewing}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        },
                    }}
                >
                    {isReviewing ? t('common.loading') : t('ad_review.review_button')}
                </Button>
            </Box>

            {/* Review Results */}
            {adReview && (
                <Box>
                    {/* Overall Score Card */}
                    <Card
                        sx={{
                            mb: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 3,
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="overline" sx={{ opacity: 0.9 }}>
                                {t('ad_review.overall_score')}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, my: 2 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    star <= Math.round(adReview.overallScore / 2) ? (
                                        <StarIcon key={star} sx={{ fontSize: 40, color: '#ffd700' }} />
                                    ) : (
                                        <StarBorderIcon key={star} sx={{ fontSize: 40, color: 'rgba(255,215,0,0.5)' }} />
                                    )
                                ))}
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 700 }}>
                                {adReview.overallScore}/10
                            </Typography>
                            {adReview.topSuggestion && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                                        <SuggestionIcon sx={{ fontSize: 20 }} />
                                        <Typography variant="subtitle2">{t('ad_review.top_recommendation')}</Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        {adReview.topSuggestion}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Cards */}
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {t('ad_review.detailed_ratings')}
                    </Typography>
                    <Stack spacing={2}>
                        {adReview.categories?.map((category, index) => (
                            <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: 3,
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {category.name}
                                            </Typography>
                                            <StarRating score={category.score} />
                                        </Box>
                                        <Chip
                                            label={category.score >= 8 ? t('ad_review.rating_excellent') : category.score >= 6 ? t('ad_review.rating_good') : category.score >= 4 ? t('ad_review.rating_needs_work') : t('ad_review.rating_critical')}
                                            color={category.score >= 8 ? 'success' : category.score >= 6 ? 'info' : category.score >= 4 ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {category.feedback}
                                    </Typography>

                                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <SuggestionIcon fontSize="small" color="primary" />
                                            <Typography variant="subtitle2" color="primary">
                                                {t('ad_review.suggested_improvement')}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {category.improvement}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={isApplyingImprovement === category.name ? null : <ImproveIcon />}
                                        onClick={() => onApplyImprovement(category)}
                                        disabled={isApplyingImprovement !== null}
                                        sx={{
                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #0f8a7e 0%, #2fd96e 100%)',
                                            },
                                        }}
                                    >
                                        {isApplyingImprovement === category.name ? t('common.loading') : t('ad_review.apply_improvement')}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Empty State */}
            {!adReview && !isReviewing && (
                <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'action.hover', borderRadius: 3 }}>
                    <ReviewIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('ad_review.empty_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('ad_review.empty_description')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AdReviewTab;

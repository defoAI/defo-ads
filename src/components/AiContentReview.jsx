// File: src/components/AiContentReview.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Component to review and select/deselect AI-generated assets.

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Button,
    Grid,
    useTheme,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as SelectedIcon,
    RadioButtonUnchecked as UnselectedIcon,
    GroupWork as AdGroupIcon,
    VpnKey as KeywordIcon,
    Web as AdIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AiContentReview = ({ generatedData, onSelectionChange }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    // Local state to track selections
    // Structure: { adGroups: { [name]: boolean }, keywords: { [text]: boolean }, ads: { [headline1]: boolean } }
    // Ideally we use indices or unique IDs if available, but for now we'll use a composite key approach or just map index.
    // Let's use indices to be safe as generated content might have duplicates.

    const [selectedAdGroups, setSelectedAdGroups] = useState({});
    const [selectedKeywords, setSelectedKeywords] = useState({});
    const [selectedAds, setSelectedAds] = useState({});

    // Initialize selections to true
    useEffect(() => {
        if (!generatedData) return;

        const initialAdGroups = {};
        generatedData.adGroups?.forEach((_, i) => initialAdGroups[i] = true);

        const initialKeywords = {};
        generatedData.keywords?.forEach((_, i) => initialKeywords[i] = true);

        const initialAds = {};
        generatedData.ads?.forEach((_, i) => initialAds[i] = true);

        setSelectedAdGroups(initialAdGroups);
        setSelectedKeywords(initialKeywords);
        setSelectedAds(initialAds);

        // Notify parent immediately
        notifyParent(initialAdGroups, initialKeywords, initialAds);
    }, [generatedData]);

    const notifyParent = (adGroups, keywords, ads) => {
        if (!onSelectionChange) return;

        const filteredData = {
            ...generatedData,
            adGroups: generatedData.adGroups?.filter((_, i) => adGroups[i]),
            keywords: generatedData.keywords?.filter((_, i) => keywords[i]),
            ads: generatedData.ads?.filter((_, i) => ads[i]),
        };
        onSelectionChange(filteredData);
    };

    const handleAdGroupToggle = (index) => {
        const newState = { ...selectedAdGroups, [index]: !selectedAdGroups[index] };
        setSelectedAdGroups(newState);

        // Also toggle all children keywords/ads for this ad group
        const adGroupName = generatedData.adGroups[index].name;

        const newKeywords = { ...selectedKeywords };
        generatedData.keywords?.forEach((kw, i) => {
            if (kw.adGroup === adGroupName) newKeywords[i] = newState[index];
        });
        setSelectedKeywords(newKeywords);

        const newAds = { ...selectedAds };
        generatedData.ads?.forEach((ad, i) => {
            if (ad.adGroup === adGroupName) newAds[i] = newState[index];
        });
        setSelectedAds(newAds);

        notifyParent(newState, newKeywords, newAds);
    };

    const handleKeywordToggle = (index) => {
        const newState = { ...selectedKeywords, [index]: !selectedKeywords[index] };
        setSelectedKeywords(newState);
        notifyParent(selectedAdGroups, newState, selectedAds);
    };

    const handleAdToggle = (index) => {
        const newState = { ...selectedAds, [index]: !selectedAds[index] };
        setSelectedAds(newState);
        notifyParent(selectedAdGroups, selectedKeywords, newState);
    };

    if (!generatedData) return null;

    // Group items by Ad Group for display
    const itemsByAdGroup = generatedData.adGroups?.map((ag, index) => {
        const groupKeywords = generatedData.keywords?.map((kw, i) => ({ ...kw, originalIndex: i }))
            .filter(kw => kw.adGroup === ag.name) || [];
        const groupAds = generatedData.ads?.map((ad, i) => ({ ...ad, originalIndex: i }))
            .filter(ad => ad.adGroup === ag.name) || [];

        return {
            ...ag,
            originalIndex: index,
            keywords: groupKeywords,
            ads: groupAds
        };
    }) || [];

    const selectedAdGroupCount = Object.values(selectedAdGroups).filter(Boolean).length;
    const selectedKeywordCount = Object.values(selectedKeywords).filter(Boolean).length;
    const selectedAdCount = Object.values(selectedAds).filter(Boolean).length;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip icon={<AdGroupIcon />} label={`${selectedAdGroupCount} ${t('common.ad_groups', 'Ad Groups')}`} color="primary" variant="outlined" />
                <Chip icon={<KeywordIcon />} label={`${selectedKeywordCount} ${t('common.keywords', 'Keywords')}`} color="primary" variant="outlined" />
                <Chip icon={<AdIcon />} label={`${selectedAdCount} ${t('common.ads', 'Ads')}`} color="primary" variant="outlined" />
            </Box>

            {itemsByAdGroup.map((group) => (
                <Accordion key={group.originalIndex} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <FormControlLabel
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            control={
                                <Checkbox
                                    checked={!!selectedAdGroups[group.originalIndex]}
                                    onChange={() => handleAdGroupToggle(group.originalIndex)}
                                />
                            }
                            label={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {group.name}
                                </Typography>
                            }
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('common.keywords', 'Keywords')} ({group.keywords.length})
                                </Typography>
                                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <List dense>
                                        {group.keywords.map((kw) => (
                                            <ListItem key={kw.originalIndex} disablePadding>
                                                <ListItemText
                                                    primary={
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={!!selectedKeywords[kw.originalIndex]}
                                                                    onChange={() => handleKeywordToggle(kw.originalIndex)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={kw.keyword}
                                                            sx={{ width: '100%', mr: 0 }}
                                                        />
                                                    }
                                                    secondary={kw.matchType}
                                                    sx={{ px: 2 }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('common.ads', 'Ads')} ({group.ads.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {group.ads.map((ad) => (
                                        <Paper
                                            key={ad.originalIndex}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                borderColor: selectedAds[ad.originalIndex] ? 'primary.main' : 'divider',
                                                bgcolor: selectedAds[ad.originalIndex] ? 'action.hover' : 'background.paper',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleAdToggle(ad.originalIndex)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <Checkbox
                                                    checked={!!selectedAds[ad.originalIndex]}
                                                    onChange={() => handleAdToggle(ad.originalIndex)}
                                                    size="small"
                                                    sx={{ p: 0.5, mt: -0.5 }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#1a0dab', fontWeight: 500 }}>
                                                        {ad.headline1} | {ad.headline2}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {ad.description1}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default AiContentReview;

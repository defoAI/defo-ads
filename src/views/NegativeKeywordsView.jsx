// File: src/views/NegativeKeywordsView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Negative keywords management view with list editor and conflict detection.

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdsStore } from '../store/useAdsStore';
import { detectConflicts } from '../utils/negativeKeywordUtils';

// -- Sub-components (could receive their own files later) --

const ListsManager = () => {
    const { t } = useTranslation();
    const { negativeKeywordLists, addNegativeKeywordList, deleteNegativeKeywordList, updateNegativeKeywordList } = useAdsStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingList, setEditingList] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [keywords, setKeywords] = useState('');

    const handleOpenCreate = () => {
        setEditingList(null);
        setName('');
        setKeywords('');
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (list) => {
        setEditingList(list);
        setName(list.name);
        setKeywords(list.keywords.join('\n'));
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        const keywordsArray = keywords.split('\n').map(k => k.trim()).filter(k => k);

        if (editingList) {
            updateNegativeKeywordList(editingList.id, {
                name,
                keywords: keywordsArray
            });
        } else {
            addNegativeKeywordList({
                id: Date.now().toString(),
                name,
                type: 'custom',
                keywords: keywordsArray,
                appliedToCampaignIds: []
            });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('common.delete') + '?')) {
            deleteNegativeKeywordList(id);
        }
    };

    const universalLists = negativeKeywordLists.filter(l => l.type === 'universal');
    const customLists = negativeKeywordLists.filter(l => l.type !== 'universal');

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">{t('negative_keywords.lists.universal_lists')}</Typography>
            </Box>

            <Paper sx={{ mb: 4 }}>
                <List>
                    {universalLists.map((list, index) => (
                        <React.Fragment key={list.id}>
                            {index > 0 && <Divider />}
                            <ListItem>
                                <ListItemText
                                    primary={list.name}
                                    secondary={`${list.keywords.length} keywords`}
                                />
                                {/* Universal lists are read-only for now logic-wise, but maybe users want to toggle them? For now, just view. */}
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{t('negative_keywords.lists.custom_lists')}</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                        },
                    }}
                >
                    {t('negative_keywords.lists.create_list')}
                </Button>
            </Box>

            {customLists.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">{t('negative_keywords.lists.no_custom_lists')}</Typography>
                </Paper>
            ) : (
                <Paper>
                    <List>
                        {customLists.map((list, index) => (
                            <React.Fragment key={list.id}>
                                {index > 0 && <Divider />}
                                <ListItem>
                                    <ListItemText
                                        primary={list.name}
                                        secondary={`${list.keywords.length} keywords`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleOpenEdit(list)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(list.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingList ? t('negative_keywords.dialog.edit_title') : t('negative_keywords.dialog.create_title')}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('negative_keywords.dialog.name_label')}
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label={t('negative_keywords.dialog.keywords_label')}
                        fullWidth
                        multiline
                        rows={6}
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        helperText={t('negative_keywords.dialog.keywords_helper')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave} variant="contained">{t('negative_keywords.dialog.save')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const ConflictDetector = () => {
    const { t } = useTranslation();
    const { campaigns, adGroups, keywords, negativeKeywordLists } = useAdsStore();
    const [conflicts, setConflicts] = useState([]);
    const [hasRun, setHasRun] = useState(false);

    const runCheck = () => {
        const foundConflicts = detectConflicts(keywords, negativeKeywordLists, adGroups, campaigns);
        setConflicts(foundConflicts);
        setHasRun(true);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={runCheck}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                        },
                    }}
                >
                    {t('negative_keywords.conflicts.run_check')}
                </Button>
            </Box>

            {hasRun && conflicts.length === 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {t('negative_keywords.conflicts.no_conflicts')}
                </Alert>
            )}

            {hasRun && conflicts.length > 0 && (
                <>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('negative_keywords.conflicts.conflicts_found', { count: conflicts.length })}
                    </Alert>
                    <Paper>
                        <List>
                            {conflicts.map((conflict, index) => (
                                <React.Fragment key={conflict.id}>
                                    {index > 0 && <Divider />}
                                    <ListItem>
                                        <ListItemText
                                            primary={`${conflict.positive} ❌ ${conflict.negative}`}
                                            secondary={t('negative_keywords.conflicts.conflict_description', {
                                                negative: conflict.negative,
                                                list: conflict.list,
                                                positive: conflict.positive,
                                                campaign: conflict.campaign
                                            })}
                                        />
                                        <Button size="small" color="primary">
                                            {t('negative_keywords.conflicts.ignore_action')}
                                        </Button>
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </>
            )}
        </Box>
    );
};

const NegativeKeywordsView = () => {
    const { t } = useTranslation();
    const [tabDetails, setTabDetails] = useState(0);

    const handleChangeTab = (event, newValue) => {
        setTabDetails(newValue);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" paragraph>
                {t('negative_keywords.subtitle')}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabDetails} onChange={handleChangeTab}>
                    <Tab label={t('negative_keywords.tabs.lists')} />
                    <Tab label={t('negative_keywords.tabs.conflicts')} />
                </Tabs>
            </Box>

            {tabDetails === 0 && <ListsManager />}
            {tabDetails === 1 && <ConflictDetector />}
        </Box>
    );
};

export default NegativeKeywordsView;

// File: src/components/ImportDialog.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    Box,
    TextField,
    Typography,
    LinearProgress,
    Alert,
    Stack,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { CloudUpload as UploadIcon, ContentPaste as PasteIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';
import Papa from 'papaparse';
import { useAdsStore } from '../store/useAdsStore';
import { trackImportDialogOpen, trackImportSuccess, trackImportError } from '../services/analyticsService';
import { useTranslation } from 'react-i18next';

const ImportDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [textData, setTextData] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successStats, setSuccessStats] = useState(null);


    const [importMethod, setImportMethod] = useState(null);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { importData } = useAdsStore();

    // Track dialog open
    useEffect(() => {
        if (open) {
            trackImportDialogOpen();
        }
    }, [open]);

    const handleReset = () => {
        setTextData('');
        setError(null);
        setSuccessStats(null);
        setLoading(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const processCsv = (data, method) => {
        setLoading(true);
        setError(null);
        setImportMethod(method);

        // Small delay to show loading state for UX
        setTimeout(() => {
            try {
                const stats = importData(data);
                setSuccessStats(stats);
                trackImportSuccess(method, stats);
                setLoading(false);
            } catch (err) {
                console.error(err);
                const errorMsg = t('import.messages.processing_failed');
                setError(errorMsg);
                trackImportError(method, errorMsg);
                setLoading(false);
            }
        }, 500);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors && results.errors.length > 0) {
                    console.warn("CSV Warnings:", results.errors);
                }
                processCsv(results.data, 'file');
            },
            error: (err) => {
                const errorMsg = t('import.messages.parsing_error', { error: err.message });
                setError(errorMsg);
                trackImportError('file', errorMsg);
                setLoading(false);
            }
        });

        // Reset input
        event.target.value = '';
    };

    const handleTextImport = () => {
        if (!textData.trim()) {
            setError(t('import.messages.paste_required'));
            return;
        }

        setLoading(true);
        setError(null);

        Papa.parse(textData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processCsv(results.data, 'paste');
            },
            error: (err) => {
                const errorMsg = t('import.messages.parsing_error', { error: err.message });
                setError(errorMsg);
                trackImportError('paste', errorMsg);
                setLoading(false);
            }
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
        >
            <DialogTitle>{t('import.title')}</DialogTitle>

            {!successStats ? (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab icon={<UploadIcon />} iconPosition="start" label={t('import.upload_file')} />
                            <Tab icon={<PasteIcon />} iconPosition="start" label={t('import.paste_text')} />
                        </Tabs>
                    </Box>

                    <DialogContent>
                        {loading && <LinearProgress sx={{ mb: 2 }} />}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {activeTab === 0 && (
                            <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #ccc', borderRadius: 2, bgcolor: 'grey.50' }}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    size="large"
                                >
                                    {t('import.select_file')}
                                    <input
                                        type="file"
                                        hidden
                                        accept=".csv,.tsv,.txt"
                                        onChange={handleFileUpload}
                                    />
                                </Button>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    {t('import.file_support')}
                                </Typography>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <TextField
                                autoFocus
                                margin="dense"
                                id="csv-text"
                                label={t('import.paste_csv')}
                                type="text"
                                fullWidth
                                multiline
                                rows={10}
                                variant="outlined"
                                value={textData}
                                onChange={(e) => setTextData(e.target.value)}
                                placeholder={t('import.paste_placeholder')}
                                InputProps={{ style: { fontFamily: 'monospace', fontSize: '12px' } }}
                            />
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose}>{t('common.cancel')}</Button>
                        {activeTab === 1 && (
                            <Button onClick={handleTextImport} variant="contained" disabled={loading || !textData}>
                                {t('import.import_data')}
                            </Button>
                        )}
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogContent sx={{ textAlign: 'center', py: 5 }}>
                        <SuccessIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>{t('import.success_title')}</Typography>

                        <Stack spacing={1} sx={{ mt: 3, maxWidth: 300, mx: 'auto', textAlign: 'left' }}>
                            <Typography><strong>{t('import.stats.campaigns')}</strong> {successStats.campaigns}</Typography>
                            <Typography><strong>{t('import.stats.ad_groups')}</strong> {successStats.adGroups}</Typography>
                            <Typography><strong>{t('import.stats.keywords')}</strong> {successStats.keywords}</Typography>
                            <Typography><strong>{t('import.stats.ads')}</strong> {successStats.ads}</Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant="contained" autoFocus>
                            {t('common.done')}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default ImportDialog;

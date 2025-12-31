import React from 'react';
import {
    Box,
    Grid,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const AdGroupGeneralTab = ({ adGroup, editMode }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={t('adGroup.name')}
                        value={adGroup.name}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label={t('adGroup.max_cpc')}
                        type="number"
                        value={adGroup.maxCpc}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label={t('adGroup.status')}
                        value={adGroup.status}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={t('adGroup.type')}
                        value={adGroup.type}
                        disabled={!editMode}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdGroupGeneralTab;

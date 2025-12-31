import React from 'react';
import {
    Box,
    Grid,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const CampaignGeneralTab = ({ campaign, editMode }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={t('campaign_detail.fields.campaign_name')}
                        value={campaign.Campaign}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label={t('campaign_detail.fields.budget')}
                        type="number"
                        value={campaign.Budget}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label={t('campaign_detail.fields.status')}
                        value={campaign.Status}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={t('campaign_detail.fields.networks')}
                        value={campaign.Networks}
                        disabled={!editMode}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={t('campaign_detail.fields.languages')}
                        value={campaign.Languages}
                        disabled={!editMode}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default CampaignGeneralTab;

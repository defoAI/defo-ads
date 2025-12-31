import React from 'react';
import { Box } from '@mui/material';
import EntityListView from '../EntityListView';

const CampaignAdGroupsTab = ({ campaignId }) => {
    return (
        <Box sx={{ p: 2 }}>
            {/* Contextual List: Only Ad Groups for THIS Campaign */}
            <EntityListView type="adGroup" filter={{ campaignId: Number(campaignId) }} />
        </Box>
    );
};

export default CampaignAdGroupsTab;

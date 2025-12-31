import React from 'react';
import { Box, TextField } from '@mui/material';

const CampaignJsonTab = ({ jsonData, editMode }) => {
    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                multiline
                rows={15}
                value={jsonData}
                disabled={!editMode}
                InputProps={{ style: { fontFamily: 'monospace', fontSize: '13px' } }}
            />
        </Box>
    );
};

export default CampaignJsonTab;

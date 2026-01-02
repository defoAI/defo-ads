// File: src/views/AdGroupDetail/AdGroupJsonTab.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// JSON view/edit tab for ad group data.

import React from 'react';
import { Box, TextField } from '@mui/material';

const AdGroupJsonTab = ({ jsonData, editMode }) => {
    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                multiline
                rows={12}
                value={jsonData}
                disabled={!editMode}
                InputProps={{ style: { fontFamily: 'monospace', fontSize: '13px' } }}
            />
        </Box>
    );
};

export default AdGroupJsonTab;

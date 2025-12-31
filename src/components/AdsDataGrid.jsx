// File: src/components/AdsDataGrid.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

/**
 * Reusable Data Grid for Ads Data
 */
const AdsDataGrid = ({ rows, columns, onEdit, loading }) => {
    return (
        <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                }}
                checkboxSelection
                disableRowSelectionOnClick
                processRowUpdate={(newRow) => {
                    if (onEdit) onEdit(newRow);
                    return newRow;
                }}
                loading={loading}
                autosizeOnMount
                autosizeOptions={{
                    includeHeaders: true,
                    includeOutliers: true,
                    expand: true,
                }}
                sx={{
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                }}
            />
        </Box>
    );
};

export default AdsDataGrid;

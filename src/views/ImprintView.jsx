// File: src/views/ImprintView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Legal imprint view displaying company information.

import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const ImprintView = () => {
    return (
        <Box sx={{ animation: 'fadeIn 0.3s' }}>
            <Typography variant="h6" gutterBottom>
                DefoAI UG (haftungsbeschränkt)
            </Typography>

            <Typography paragraph>
                Wiltinger Straße 11<br />
                13465 Berlin<br />
                Deutschland
            </Typography>

            <Typography paragraph>
                <strong>Kontakt:</strong><br />
                E-Mail: <Link href="mailto:info@defoai.com">info@defoai.com</Link>
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                3. Registereintrag
            </Typography>
            <Typography paragraph>
                Registergericht: Amtsgericht Charlottenburg<br />
                Registernummer: HRB 275524 B
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                4. Vertretungsberechtigte Geschäftsführer
            </Typography>
            <Typography paragraph>
                Nicholas David Hart
            </Typography>
        </Box>
    );
};

export default ImprintView;

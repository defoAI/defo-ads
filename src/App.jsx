// File: src/App.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Application root with router configuration.

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MainLayout from './components/MainLayout';
import CampaignsView from './views/CampaignsView';
import CampaignDetailView from './views/CampaignDetailView';
import AdGroupDetailView from './views/AdGroupDetailView';
import AdDetailView from './views/AdDetailView';
import SettingsView from './views/SettingsView';
import EntityListView from './views/EntityListView';
import SitesView from './views/SitesView';
import SiteDetailView from './views/SiteDetailView';
import NegativeKeywordsView from './views/NegativeKeywordsView';
import CookieConsent from './components/CookieConsent';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
            {/* Default redirect */}
            <Route index element={<Navigate to="/sites" replace />} />

            {/* Campaigns */}
            <Route path="campaigns" element={<CampaignsView />} />
            <Route path="campaigns/:campaignId" element={<CampaignDetailView />} />
            <Route path="campaigns/:campaignId/adgroups/:adGroupId" element={<AdGroupDetailView />} />

            {/* Top-level Ad Groups, Keywords, Ads (flat views) */}
            <Route path="adgroups" element={<EntityListView type="adGroup" />} />
            <Route path="keywords" element={<EntityListView type="keyword" />} />
            <Route path="ads" element={<EntityListView type="ad" />} />
            <Route path="ads/:id" element={<AdDetailView />} />
            <Route path="sites" element={<SitesView />} />
            <Route path="sites/:id" element={<SiteDetailView />} />
            <Route path="negative-keywords" element={<NegativeKeywordsView />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <CookieConsent />
    </ThemeProvider>
  );
}

export default App;

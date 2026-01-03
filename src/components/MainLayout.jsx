// File: src/components/MainLayout.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Main application layout with sidebar navigation and content outlet.
// Mirrors the AdminLayout pattern from defoai-app-admin-fe.

import React, { useRef, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import ImportDialog from './ImportDialog';
import ExportDialog from './ExportDialog';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    CssBaseline,
    Button,
    Divider,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import {
    Campaign as CampaignIcon,
    ViewList as AdGroupIcon,
    TextFields as KeywordIcon,
    Article as AdsIcon,
    CloudUpload as ImportIcon,
    CloudDownload as ExportIcon,
    AutoAwesome as AiIcon,
    Settings as SettingsIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Home as HomeIcon,
    GitHub as GitHubIcon,
    Language as SiteIcon,
    Menu as MenuIcon,
    Block as BlockIcon,
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { useTheme, useMediaQuery } from '@mui/material';
import IntroWizard from './IntroWizard';

const drawerWidth = 220;

// Navigation items for the sidebar
const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon />, i18nKey: 'nav.home' },
    { path: '/sites', label: 'Sites', icon: <SiteIcon />, i18nKey: 'nav.sites' },
    { path: '/campaigns', label: 'Campaigns', icon: <CampaignIcon />, i18nKey: 'nav.campaigns' },
    { path: '/adgroups', label: 'Ad Groups', icon: <AdGroupIcon />, i18nKey: 'nav.adgroups' },
    { path: '/ads', label: 'Ads', icon: <AdsIcon />, i18nKey: 'nav.ads' },
    { path: '/keywords', label: 'Keywords', icon: <KeywordIcon />, i18nKey: 'nav.keywords' },
    { path: '/negative-keywords', label: 'Negative Keywords', icon: <BlockIcon />, i18nKey: 'nav.negative_keywords' },

];

// MainLayout Component
const MainLayout = ({ darkMode, setDarkMode }) => {
    const location = useLocation();
    const [importOpen, setImportOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [introOpen, setIntroOpen] = useState(() => !localStorage.getItem('hasSeenIntro'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { importData } = useAdsStore();

    // Responsive breakpoints
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { t, i18n } = useTranslation();
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

    // Available languages with flags - only show languages that have translation files
    const supportedLanguages = ['en', 'de', 'fr'];
    const allLanguages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
        { code: 'pl', name: 'Polski', flag: '🇵🇱' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
    ];
    const languages = allLanguages.filter(lang => supportedLanguages.includes(lang.code));

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLanguageMenuAnchor(null);
    };

    const handleLanguageMenuOpen = (event) => {
        setLanguageMenuAnchor(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setLanguageMenuAnchor(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.startsWith('/campaigns/') && path.includes('/adgroups/')) return t('nav.adgroups'); // Or more specific
        if (path.startsWith('/campaigns/')) return t('nav.campaigns');
        if (path.startsWith('/campaigns')) return t('nav.campaigns');
        if (path.startsWith('/adgroups/')) return t('nav.adgroups');
        if (path.startsWith('/adgroups')) return t('nav.adgroups');
        if (path.startsWith('/keywords/')) return t('nav.keywords');
        if (path.startsWith('/keywords')) return t('nav.keywords');
        if (path.startsWith('/ads/')) return t('nav.ads');
        if (path.startsWith('/ads')) return t('nav.ads');
        if (path.startsWith('/negative-keywords')) return t('nav.negative_keywords');
        if (path.startsWith('/sites')) return t('nav.sites');
        if (path.startsWith('/settings')) return t('app.settings');
        return t('app.dashboard');
    };

    const drawerContent = (
        <div>
            <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
                <Box
                    component="img"
                    src="/logo.png"
                    alt="Defo Ads Logo"
                    sx={{
                        maxWidth: 160,
                        height: 'auto',
                        objectFit: 'contain',
                    }}
                />
            </Toolbar>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            component={NavLink}
                            to={item.path}
                            onClick={() => isMobile && setMobileOpen(false)}
                            sx={{
                                '&.active': {
                                    backgroundColor: 'action.selected',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={t(item.i18nKey)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 1 }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        component={NavLink}
                        to="/settings"
                        onClick={() => isMobile && setMobileOpen(false)}
                        sx={{
                            '&.active': {
                                backgroundColor: 'action.selected',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': {
                                    color: 'primary.main',
                                },
                            },
                        }}
                    >
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText primary={t('app.settings')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
            <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
            <IntroWizard open={introOpen} onClose={() => setIntroOpen(false)} />

            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: (t) => alpha(t.palette.background.paper, 0.85),
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <HomeIcon sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
                        <Typography variant="h6" noWrap component="div">
                            {getPageTitle()}
                        </Typography>
                    </Box>

                    {/* Language Switcher */}
                    <Tooltip title={t('common.select_language') || 'Select Language'}>
                        <Button
                            color="inherit"
                            onClick={handleLanguageMenuOpen}
                            startIcon={<SiteIcon />}
                            sx={{ mr: 1, minWidth: 100 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span>{currentLanguage.flag}</span>
                                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {currentLanguage.code.toUpperCase()}
                                </Typography>
                            </Box>
                        </Button>
                    </Tooltip>
                    <Menu
                        anchorEl={languageMenuAnchor}
                        open={Boolean(languageMenuAnchor)}
                        onClose={handleLanguageMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 200,
                                maxHeight: 400,
                            }
                        }}
                    >
                        {languages.map((lang) => (
                            <MenuItem
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                selected={i18n.language === lang.code}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    py: 1.5,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    {lang.flag}
                                </Typography>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1">
                                        {lang.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {lang.code.toUpperCase()}
                                    </Typography>
                                </Box>
                                {i18n.language === lang.code && (
                                    <Typography variant="body2" color="primary">
                                        ✓
                                    </Typography>
                                )}
                            </MenuItem>
                        ))}
                    </Menu>

                    <Tooltip title={t('app.import')}>
                        <Button
                            color="inherit"
                            startIcon={<ImportIcon />}
                            onClick={() => setImportOpen(true)}
                            sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
                        >
                            {t('app.import')}
                        </Button>
                    </Tooltip>
                    {/* Mobile Import Icon */}
                    <IconButton
                        color="inherit"
                        onClick={() => setImportOpen(true)}
                        sx={{ display: { xs: 'flex', sm: 'none' } }}
                    >
                        <ImportIcon />
                    </IconButton>

                    <Tooltip title={t('app.export')}>
                        <Button
                            color="inherit"
                            startIcon={<ExportIcon />}
                            onClick={() => setExportOpen(true)}
                            sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
                        >
                            {t('app.export')}
                        </Button>
                    </Tooltip>
                    {/* Mobile Export Icon */}
                    <IconButton
                        color="inherit"
                        onClick={() => setExportOpen(true)}
                        sx={{ display: { xs: 'flex', sm: 'none' } }}
                    >
                        <ExportIcon />
                    </IconButton>


                    <Tooltip title={t('navigation.view_on_github')}>
                        <IconButton
                            color="inherit"
                            component="a"
                            href="https://github.com/defoai/defo-ads"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            <GitHubIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={darkMode ? t('navigation.switch_to_light_mode') : t('navigation.switch_to_dark_mode')}>
                        <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                {/* Mobile Temporary Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Permanent Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: { xs: 2, md: 3 },
                    height: '100vh',
                    overflow: 'auto',
                    width: '100%',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;

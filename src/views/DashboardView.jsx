// File: src/views/DashboardView.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Main dashboard view with metrics cards, recent activity, and quick tips.

import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Container,
    Chip,
    alpha,
    useTheme
} from '@mui/material';
import {
    Campaign as CampaignIcon,
    Language as SiteIcon,
    Article as AdsIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
    Lightbulb as TipIcon,
    ArrowForward as ArrowIcon,
    RocketLaunch as RocketIcon,
    LinkRounded as LinkIcon,
    AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { useAdsStore } from '../store/useAdsStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { keyframes } from '@mui/system';

// Subtle fade-in animation
const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const StatCard = ({ title, count, icon, color, onClick, delay = 0, testId }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            data-testid={testId}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                animation: `${fadeInUp} 0.5s ease-out ${delay}s both`,
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.text.primary, 0.08)}`,
                    borderColor: theme.palette.primary.main,
                } : {},
            }}
            onClick={onClick}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                <Avatar
                    variant="rounded"
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
                        color: theme.palette[color]?.main || theme.palette.primary.main,
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
            <Box>
                <Typography
                    variant="h3"
                    fontWeight="700"
                    color="text.primary"
                    sx={{ mb: 0.5 }}
                >
                    {count}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="500"
                >
                    {title}
                </Typography>
            </Box>
        </Paper>
    );
};

const TipCard = ({ icon, title, description, color = 'primary' }) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '3px solid',
                borderLeftColor: `${color}.main`,
                mb: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: `${color}.main`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.text.primary, 0.06)}`,
                }
            }}
        >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar
                    variant="rounded"
                    sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(theme.palette[color].main, 0.1),
                        color: `${color}.main`,
                        '& svg': { fontSize: 18 }
                    }}
                >
                    {icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.25 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {description}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

const DashboardView = () => {
    const { campaigns, ads, keywords, sites } = useAdsStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();

    // Calculate Recents
    const getRecentActivity = () => {
        const allItems = [
            ...campaigns.map(c => ({ ...c, type: 'campaign', label: c.name || c.Campaign, path: `/campaigns/${c.id}` })),
            ...sites.map(s => ({ ...s, type: 'site', label: s.name || s.url, path: `/sites/${s.id}` }))
        ];

        return allItems
            .filter(item => item.updatedAt || item.createdAt)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5);
    };

    const recents = getRecentActivity();
    const hasSites = sites.length > 0;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    animation: `${fadeInUp} 0.4s ease-out`,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="700"
                        color="text.primary"
                        gutterBottom
                    >
                        {t('dashboard.welcome', 'Welcome back')}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        {t('dashboard.overview_subtitle', "Here's what's happening with your ads today.")}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    data-testid="btn-cta-primary"
                    startIcon={hasSites ? <AddIcon /> : <SiteIcon />}
                    onClick={() => navigate(hasSites ? '/campaigns' : '/sites')}
                    sx={{
                        px: 3,
                        py: 1.25,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                    }}
                >
                    {hasSites
                        ? t('campaigns.new', 'New Campaign')
                        : t('sites.add_first', 'Add Your First Site')}
                </Button>
            </Box>

            {/* Metrics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('nav.campaigns', 'Campaigns')}
                        count={campaigns.length}
                        icon={<CampaignIcon />}
                        color="primary"
                        onClick={() => navigate('/campaigns')}
                        delay={0.05}
                        testId="stat-campaigns"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('nav.ads', 'Ads')}
                        count={ads.length}
                        icon={<AdsIcon />}
                        color="secondary"
                        onClick={() => navigate('/ads')}
                        delay={0.1}
                        testId="stat-ads"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('nav.sites', 'Sites')}
                        count={sites.length}
                        icon={<SiteIcon />}
                        color="success"
                        onClick={() => navigate('/sites')}
                        delay={0.15}
                        testId="stat-sites"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('nav.keywords', 'Keywords')}
                        count={keywords.length}
                        icon={<TrendingUpIcon />}
                        color="warning"
                        onClick={() => navigate('/keywords')}
                        delay={0.2}
                        testId="stat-keywords"
                    />
                </Grid>
            </Grid>

            {/* Recent Activity Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        data-testid="recent-activity"
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                            animation: `${fadeInUp} 0.5s ease-out 0.2s both`,
                        }}
                    >
                        <Box
                            sx={{
                                p: 2.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <HistoryIcon color="action" />
                                <Typography variant="h6" fontWeight="600">
                                    {t('dashboard.recent_activity', 'Recent Activity')}
                                </Typography>
                            </Box>
                            {recents.length > 0 && (
                                <Button
                                    size="small"
                                    endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => navigate('/campaigns')}
                                    sx={{ textTransform: 'none', fontWeight: 500 }}
                                >
                                    {t('dashboard.view_all', 'View All')}
                                </Button>
                            )}
                        </Box>
                        <List sx={{ py: 0 }}>
                            {recents.length === 0 ? (
                                <Box sx={{ p: 5, textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: theme.palette.primary.main,
                                            mx: 'auto',
                                            mb: 2.5,
                                        }}
                                    >
                                        {hasSites ? <RocketIcon sx={{ fontSize: 32 }} /> : <SiteIcon sx={{ fontSize: 32 }} />}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {hasSites
                                            ? t('dashboard.no_activity_title', 'Get Started')
                                            : t('dashboard.no_sites_title', 'Start with a Site')}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
                                        {hasSites
                                            ? t('dashboard.no_activity', 'No recent activity found. Start by creating a campaign!')
                                            : t('dashboard.no_sites_desc', 'Add your first site to give the AI context for generating better ad copy.')}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={hasSites ? <AddIcon /> : <SiteIcon />}
                                        onClick={() => navigate(hasSites ? '/campaigns' : '/sites')}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            px: 3,
                                            boxShadow: 'none',
                                        }}
                                    >
                                        {hasSites
                                            ? t('campaigns.create_first', 'Create Your First Campaign')
                                            : t('sites.add_first', 'Add Your First Site')}
                                    </Button>
                                </Box>
                            ) : (
                                recents.map((item, index) => (
                                    <React.Fragment key={`${item.type}-${item.id}`}>
                                        <ListItem
                                            button
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                py: 2,
                                                px: 2.5,
                                                transition: 'background 0.15s ease',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        bgcolor: alpha(
                                                            item.type === 'campaign'
                                                                ? theme.palette.primary.main
                                                                : theme.palette.success.main,
                                                            0.1
                                                        ),
                                                        color: item.type === 'campaign'
                                                            ? theme.palette.primary.main
                                                            : theme.palette.success.main,
                                                    }}
                                                >
                                                    {item.type === 'campaign' ? <CampaignIcon /> : <SiteIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                sx={{ ml: 0.5 }}
                                                primary={
                                                    <Typography fontWeight="500">
                                                        {item.label}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        <Chip
                                                            size="small"
                                                            label={item.type === 'campaign' ? 'Campaign' : 'Site'}
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.7rem',
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Button
                                                size="small"
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    minWidth: 'auto',
                                                }}
                                            >
                                                {t('common.edit', 'Edit')}
                                            </Button>
                                        </ListItem>
                                        {index < recents.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Quick Tips Panel */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        data-testid="quick-tips"
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            height: '100%',
                            animation: `${fadeInUp} 0.5s ease-out 0.25s both`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                            <TipIcon color="action" />
                            <Typography variant="h6" fontWeight="600">
                                {t('dashboard.quick_tips', 'Quick Tips')}
                            </Typography>
                        </Box>

                        <TipCard
                            icon={<LinkIcon />}
                            title={t('dashboard.tip_context_title', 'Connect Context')}
                            description={t('dashboard.tip_context_desc', "Add 'Sites' to give AI better context for generation.")}
                            color="primary"
                        />
                        <TipCard
                            icon={<SparkleIcon />}
                            title={t('dashboard.tip_ai_title', 'Generative AI')}
                            description={t('dashboard.tip_ai_desc', "Use the 'Generate' button in Campaigns to create ad copy instantly.")}
                            color="secondary"
                        />
                        <TipCard
                            icon={<RocketIcon />}
                            title={t('dashboard.tip_export_title', 'Export Ready')}
                            description={t('dashboard.tip_export_desc', 'Export your campaigns directly to Google Ads format when ready.')}
                            color="success"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardView;

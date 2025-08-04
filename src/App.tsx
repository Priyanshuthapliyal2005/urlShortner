import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { LinkIcon, BarChart3 } from 'lucide-react';
import UrlShortenerForm from './components/UrlShortenerForm';
import StatisticsTable from './components/StatisticsTable';
import HealthStatus from './components/HealthStatus';
import AuthButton from './components/AuthButton';
import { UrlData } from './types';
import { fetchUrls } from './api';
import { useAuth, AuthProvider } from './hooks/useAuth.tsx';
import AnimatedBackground from './components/AnimatedBackground';
import SEOHead from './components/SEOHead';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AppContent() {
  const [tabValue, setTabValue] = useState(0);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadUrls = async () => {
    if (!user) {
      setUrls([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetchUrls();
      setUrls(response.urls);
    } catch (error) {
      console.error('Error loading URLs:', error);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, [user]);

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  URL Shortener
                </Typography>
                <Typography variant="subtitle1">
                  Create short URLs with custom codes and track their performance
                </Typography>
              </Box>
              <AuthButton />
            </Box>
          </Box>
          
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<LinkIcon size={20} />}
              label="Shorten URLs"
              iconPosition="start"
            />
            <Tab
              icon={<BarChart3 size={20} />}
              label="Statistics"
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <UrlShortenerForm onUrlsCreated={loadUrls} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <HealthStatus />
            <StatisticsTable urls={urls} loading={loading} onRefresh={loadUrls} />
          </TabPanel>
        </Paper>
      </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedBackground />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
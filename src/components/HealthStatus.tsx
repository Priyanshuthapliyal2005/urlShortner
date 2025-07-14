import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import { Activity, ChevronDown, ChevronUp, Server, Clock, Database } from 'lucide-react';
import { checkHealth } from '../api';
import { HealthData } from '../types';

const HealthStatus: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string>('');

  const loadHealthData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await checkHealth();
      setHealthData(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (error) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={20} color="error" />
            <Typography variant="h6" color="error">
              Service Unavailable
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <Card sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={20} color="success" />
            <Typography variant="h6">
              Service Status
            </Typography>
            <Chip 
              label={healthData.status} 
              color="success" 
              size="small" 
              variant="outlined" 
            />
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={16} />
              <Typography variant="body2">
                Uptime: {formatUptime(healthData.uptime)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Database size={16} />
              <Typography variant="body2">
                URLs: {healthData.totalUrls}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity size={16} />
              <Typography variant="body2">
                Clicks: {healthData.totalClicks}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Server size={16} />
              <Typography variant="body2">
                Env: {healthData.environment}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Node Version: {healthData.version}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Memory Usage: {formatMemory(healthData.memory.heapUsed)} / {formatMemory(healthData.memory.heapTotal)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {new Date(healthData.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                RSS Memory: {formatMemory(healthData.memory.rss)}
              </Typography>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default HealthStatus;
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Plus, Trash2, Copy, ExternalLink, Link } from 'lucide-react';
import { createShortUrls, getShortUrl } from '../api';
import { UrlData } from '../types';

interface UrlEntry {
  url: string;
  shortcode: string;
  validity: number;
}

interface Props {
  onUrlsCreated: () => void;
}

const UrlShortenerForm: React.FC<Props> = ({ onUrlsCreated }) => {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([
    { url: '', shortcode: '', validity: 30 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [createdUrls, setCreatedUrls] = useState<UrlData[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const handleUrlEntryChange = (index: number, field: keyof UrlEntry, value: string | number) => {
    const newEntries = [...urlEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setUrlEntries(newEntries);
  };

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([...urlEntries, { url: '', shortcode: '', validity: 30 }]);
    }
  };

  const removeUrlEntry = (index: number) => {
    if (urlEntries.length > 1) {
      const newEntries = urlEntries.filter((_, i) => i !== index);
      setUrlEntries(newEntries);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const filteredEntries = urlEntries.filter(entry => entry.url.trim() !== '');
      
      if (filteredEntries.length === 0) {
        setError('Please enter at least one URL');
        setLoading(false);
        return;
      }

      // For now, we'll use the first entry's validity for all URLs
      // This matches the current API structure
      const response = await createShortUrls({
        urls: filteredEntries.map(entry => entry.url),
        validity: filteredEntries[0].validity,
        shortcode: filteredEntries[0].shortcode.trim() || undefined
      });

      setCreatedUrls(response.urls);
      setUrlEntries([{ url: '', shortcode: '', validity: 30 }]);
      onUrlsCreated();
    } catch (error: any) {
      // console.error('Error caught in UrlShort  enerForm:', error);
      setError(error.message || 'Failed to create short URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setCopyMessage('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyMessage('Failed to copy');
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes > 0) {
      return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return 'Expired';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Link size={24} />
        <Typography variant="h5" component="h2">
          Create Short URLs
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter up to 5 URLs to shorten simultaneously with optional custom shortcodes
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          {urlEntries.map((entry, index) => (
            <Card 
              key={index} 
              sx={{ 
                mb: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.primary">
                    URL {index + 1}
                  </Typography>
                  {urlEntries.length > 1 && (
                    <IconButton
                      onClick={() => removeUrlEntry(index)}
                      sx={{ 
                        color: '#f44336',
                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                      }}
                      disabled={loading}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Original URL
                    </Typography>
                    <TextField
                      fullWidth
                      value={entry.url}
                      onChange={(e) => handleUrlEntryChange(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                      variant="outlined"
                      disabled={loading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Custom Shortcode (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      value={entry.shortcode}
                      onChange={(e) => handleUrlEntryChange(index, 'shortcode', e.target.value)}
                      placeholder="abc123"
                      variant="outlined"
                      disabled={loading}
                      helperText="3-10 alphanumeric characters"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                        '& .MuiFormHelperText-root': {
                          color: 'rgba(255, 255, 255, 0.6)',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Validity (Minutes)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={entry.validity}
                      onChange={(e) => handleUrlEntryChange(index, 'validity', parseInt(e.target.value) || 30)}
                      variant="outlined"
                      disabled={loading}
                      inputProps={{ min: 1, max: 10080 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          {urlEntries.length < 5 && (
            <Button
              startIcon={<Plus size={20} />}
              onClick={addUrlEntry}
              disabled={loading}
              variant="outlined"
              sx={{ 
                mb: 3,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              Add Another URL
            </Button>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ 
            minWidth: 200,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Short URLs'
          )}
        </Button>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {createdUrls.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Created Short URLs
          </Typography>
          {createdUrls.map((urlData, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Original: {urlData.originalUrl}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#ffffff' }}>
                  {getShortUrl(urlData.shortcode)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(getShortUrl(urlData.shortcode))}
                  sx={{ color: '#ffffff' }}
                >
                  <Copy size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => window.open(getShortUrl(urlData.shortcode), '_blank')}
                  sx={{ color: '#ffffff' }}
                >
                  <ExternalLink size={16} />
                </IconButton>
              </Box>
              
              <Chip
                label={formatExpiryTime(urlData.expiresAt)}
                size="small"
                color="info"
                variant="outlined"
              />
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message={copyMessage}
      />
    </Box>
  );
};

export default UrlShortenerForm;
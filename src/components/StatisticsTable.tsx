import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { Copy, ExternalLink, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { UrlData } from '../types';
import { getShortUrl, deleteUrl, fetchUrlStats } from '../api';

interface Props {
  urls: UrlData[];
  loading: boolean;
  onRefresh: () => void;
}

const StatisticsTable: React.FC<Props> = ({ urls, loading, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatExpiryStatus = (expiresAt: string, isExpired: boolean) => {
    if (isExpired) {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    }
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      return (
        <Chip
          label={`${hours}h ${minutes % 60}m left`}
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else if (minutes > 0) {
      return (
        <Chip
          label={`${minutes}m left`}
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    }
  };

  const handleDeleteClick = (shortcode: string) => {
    setUrlToDelete(shortcode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setError('');
    
    try {
      await deleteUrl(urlToDelete);
      setDeleteDialogOpen(false);
      setUrlToDelete('');
      onRefresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUrlToDelete('');
    setError('');
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          URL Statistics
        </Typography>
        <Button
          startIcon={<RefreshCw size={20} />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Last Clicked</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No URLs created yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                urls.map((url) => (
                  <TableRow key={url.shortcode}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {url.shortcode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={url.originalUrl}>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {url.originalUrl}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">
                        {url.clickCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(url.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatExpiryStatus(url.expiresAt, url.isExpired)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy short URL">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(getShortUrl(url.shortcode))}
                          >
                            <Copy size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open short URL">
                          <IconButton
                            size="small"
                            onClick={() => window.open(getShortUrl(url.shortcode), '_blank')}
                            disabled={url.isExpired}
                          >
                            <ExternalLink size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete URL">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(url.shortcode)}
                            color="error"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {url.lastClicked ? formatDate(url.lastClicked) : 'Never'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Short URL</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the short URL "{urlToDelete}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard!"
      />
    </Box>
  );
};

export default StatisticsTable;
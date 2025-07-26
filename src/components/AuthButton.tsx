import React from 'react';
import { Button, Avatar, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';

const AuthButton: React.FC = () => {
  const { user, login, logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  if (loading) {
    return (
      <Button disabled variant="outlined" size="small">
        Loading...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        variant="contained"
        startIcon={<LogIn size={16} />}
        onClick={login}
        size="small"
        sx={{
          backgroundColor: '#4285f4',
          '&:hover': {
            backgroundColor: '#3367d6',
          },
        }}
      >
        Sign in with Google
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleMenuOpen}
        variant="outlined"
        size="small"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textTransform: 'none',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: 'white',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
        }}
      >
        <Avatar
          src={user.picture}
          alt={user.name}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.name}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
          <LogOut size={16} />
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

export default AuthButton;
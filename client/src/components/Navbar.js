import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  const buttonStyle = {
    fontWeight: 600,
    borderRadius: '8px',
    padding: '8px 16px',
    textTransform: 'none',
    fontSize: '1rem'
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: '#2d3748',
            fontWeight: 600,
            letterSpacing: '1px'
          }}
        >
          Blog App
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user ? (
            <>
              <Button 
                variant="contained"
                component={RouterLink} 
                to="/create"
                sx={{
                  ...buttonStyle,
                  bgcolor: '#3182ce',
                  '&:hover': {
                    bgcolor: '#2c5282'
                  }
                }}
              >
                Create Post
              </Button>
              <Button 
                component={RouterLink} 
                to="/profile"
                sx={{ 
                  ...buttonStyle,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#2d3748',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Avatar 
                  src={user.avatar} 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid #3182ce'
                  }}
                />
                {user.username}
              </Button>
              <Button 
                onClick={logout}
                variant="outlined"
                sx={{
                  ...buttonStyle,
                  color: '#e53e3e',
                  borderColor: '#e53e3e',
                  '&:hover': {
                    bgcolor: 'rgba(229, 62, 62, 0.1)',
                    borderColor: '#c53030'
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="contained"
                component={RouterLink} 
                to="/login"
                sx={{
                  ...buttonStyle,
                  bgcolor: '#3182ce',
                  '&:hover': {
                    bgcolor: '#2c5282'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="outlined"
                component={RouterLink} 
                to="/register"
                sx={{
                  ...buttonStyle,
                  color: '#3182ce',
                  borderColor: '#3182ce',
                  '&:hover': {
                    bgcolor: 'rgba(49, 130, 206, 0.1)',
                    borderColor: '#2c5282'
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

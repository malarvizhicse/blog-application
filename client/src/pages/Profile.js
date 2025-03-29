import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Avatar, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Profile() {
  const { user, token } = useAuth();
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bio, avatar }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, p: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={avatar}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            {user?.username}
          </Typography>
          
          {editing ? (
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ width: '100%', mt: 2 }}>
              <TextField
                fullWidth
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                margin="normal"
                multiline
                rows={4}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained">
                  Save Changes
                </Button>
                <Button onClick={() => setEditing(false)} variant="outlined">
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body1" paragraph>
                {bio || 'No bio yet'}
              </Typography>
              <Button onClick={() => setEditing(true)} variant="contained">
                Edit Profile
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;

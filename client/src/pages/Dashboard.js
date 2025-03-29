import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { api } from '../utils/api';
import '../styles/common.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    image: '',
    imageFile: null,
    tags: [],
  });
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPosts();
    }
  }, [isAuthenticated]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/user');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to fetch your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    if (!isAuthenticated) {
      toast.error('Please login to edit posts');
      return;
    }
    if (user?._id !== post.author._id) {
      toast.error('You can only edit your own posts');
      return;
    }
    setSelectedPost(post);
    setEditFormData({
      title: post.title,
      content: post.content,
      image: post.image || '',
      tags: post.tags || [],
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (postId, authorId) => {
    if (!isAuthenticated) {
      toast.error('Please login to delete posts');
      return;
    }
    if (user?._id !== authorId) {
      toast.error('You can only delete your own posts');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      // Remove the post from local state
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    try {
      await api.post(`/posts/${postId}/like`);
      fetchUserPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await api.post(`/posts/${selectedPost._id}/comments`, {
        text: commentText,
      });
      toast.success('Comment added successfully');
      setCommentText('');
      setCommentDialogOpen(false);
      fetchUserPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!editFormData.tags.includes(newTag)) {
        setEditFormData({
          ...editFormData,
          tags: [...editFormData.tags, newTag],
        });
      }
      e.target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditFormData({
      ...editFormData,
      tags: editFormData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    try {
      // Handle image upload first if there's a new image
      let imagePath = editFormData.image;
      if (editFormData.imageFile) {
        const formData = new FormData();
        formData.append('image', editFormData.imageFile);
        
        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        imagePath = uploadResponse.data.filePath;
      }

      // Update post with new data including image path
      const response = await api.patch(`/posts/${selectedPost._id}`, {
        ...editFormData,
        image: imagePath,
      });

      // Update the post in the local state
      setPosts(posts.map(post => 
        post._id === selectedPost._id ? response.data : post
      ));
      setEditDialogOpen(false);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return;
      }
      setEditFormData({
        ...editFormData,
        imageFile: file,
        image: URL.createObjectURL(file) // Preview URL
      });
    }
  };

  return (
    <Box className="dashboard-page" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box 
          className="content-container"
          sx={{ 
            py: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            mb: 4,
            px: 3,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#1565C0',
              textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
            }}
          >
            My Posts
          </Typography>
          {isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-post')}
              sx={{
                mt: 2,
                background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                }
              }}
            >
              Create New Post
            </Button>
          )}
        </Box>

        {!isAuthenticated ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Please login to view your posts
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              }}
            >
              Login Now
            </Button>
          </Box>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : posts.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              You haven't created any posts yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-post')}
              sx={{
                mt: 2,
                background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              }}
            >
              Create Your First Post
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} md={6} key={post._id}>
                <Card 
                  className="post-card"
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.85) !important',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  {post.image && (
                    <CardMedia
                      component="img"
                      height="240"
                      image={post.image}
                      alt={post.title}
                      sx={{ 
                        objectFit: 'cover',
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        fontWeight: '600',
                        color: '#1565C0',
                        mb: 2
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      paragraph
                      sx={{
                        mb: 2,
                        lineHeight: 1.7
                      }}
                    >
                      {post.content.substring(0, 150)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {post.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            background: 'linear-gradient(45deg, #E3F2FD 30%, #BBDEFB 90%)',
                            color: '#1565C0',
                            fontWeight: '500',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #BBDEFB 30%, #E3F2FD 90%)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleLike(post._id)}
                          color={post.likes?.includes(user?._id) ? 'secondary' : 'default'}
                          sx={{
                            '&:hover': {
                              background: '#fce4ec',
                            }
                          }}
                        >
                          {post.likes?.includes(user?._id) ? (
                            <FavoriteIcon sx={{ color: '#e91e63' }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                        <Typography 
                          variant="body2"
                          sx={{ ml: 1, color: '#e91e63', fontWeight: '500' }}
                        >
                          {post.likes?.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small"
                          sx={{
                            '&:hover': {
                              background: '#e3f2fd',
                            }
                          }}
                        >
                          <CommentIcon sx={{ color: '#1565C0' }} />
                        </IconButton>
                        <Typography 
                          variant="body2"
                          sx={{ ml: 1, color: '#1565C0', fontWeight: '500' }}
                        >
                          {post.comments?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        startIcon={<EditIcon />}
                        variant="contained"
                        onClick={() => handleEdit(post)}
                        sx={{
                          background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                          }
                        }}
                      >
                        Edit Post
                      </Button>
                      <Button
                        fullWidth
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(post._id, post.author._id)}
                        sx={{
                          background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                          boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                          }
                        }}
                      >
                        Delete Post
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: 'linear-gradient(to right, #E3F2FD, #BBDEFB)',
              color: '#1565C0',
              fontWeight: 'bold'
            }}
          >
            Edit Post
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleEditSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Title"
                name="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976D2',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Content"
                name="content"
                multiline
                rows={4}
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976D2',
                    },
                  },
                }}
              />
              
              {/* Image Upload */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={<AddIcon />}
                    sx={{
                      borderColor: '#1976D2',
                      color: '#1976D2',
                      '&:hover': {
                        borderColor: '#1565C0',
                        background: '#E3F2FD',
                      }
                    }}
                  >
                    Upload Image
                  </Button>
                </label>
                {editFormData.image && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={editFormData.image}
                      alt="Preview"
                      style={{ 
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Button 
                      sx={{ 
                        mt: 1,
                        color: '#d32f2f',
                        '&:hover': {
                          background: '#ffebee',
                        }
                      }}
                      startIcon={<DeleteIcon />}
                      onClick={() => setEditFormData({ ...editFormData, image: '', imageFile: null })}
                    >
                      Remove Image
                    </Button>
                  </Box>
                )}
              </Box>

              <TextField
                margin="normal"
                fullWidth
                label="Add Tags (Press Enter to add)"
                onKeyDown={handleTagInput}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976D2',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {editFormData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      background: 'linear-gradient(45deg, #E3F2FD 30%, #BBDEFB 90%)',
                      color: '#1565C0',
                      fontWeight: '500',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #BBDEFB 30%, #E3F2FD 90%)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, background: '#f5f5f5' }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              sx={{
                color: '#9e9e9e',
                '&:hover': {
                  background: '#eeeeee',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog
          open={commentDialogOpen}
          onClose={() => setCommentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Comment</DialogTitle>
          <form onSubmit={handleComment}>
            <DialogContent>
              <TextField
                fullWidth
                label="Your Comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                margin="normal"
                required
                multiline
                rows={3}
              />
              {selectedPost && selectedPost.comments?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Previous Comments
                  </Typography>
                  {selectedPost.comments.map((comment, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          src={comment.user?.profilePicture}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Typography variant="subtitle2">
                          {comment.user?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{comment.text}</Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Post Comment
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;

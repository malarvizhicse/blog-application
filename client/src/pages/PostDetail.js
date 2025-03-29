import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder, Delete } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Error loading post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to like posts');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPost();
    } catch (error) {
      toast.error('Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/posts/${id}/comments`,
        { text: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComment('');
      fetchPost();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error deleting post');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container>
        <Typography>Post not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}
        >
          {post.image && (
            <Box
              component="img"
              src={post.image}
              alt={post.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 4,
              }}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={post.author.profilePicture}
              alt={post.author.username}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1">{post.author.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </Typography>
            </Box>
            {user?._id === post.author._id && (
              <IconButton
                onClick={handleDelete}
                color="error"
                sx={{ ml: 'auto' }}
              >
                <Delete />
              </IconButton>
            )}
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{ backgroundColor: '#e3f2fd' }}
              />
            ))}
          </Box>

          <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={handleLike} color={post.likes.includes(user?._id) ? 'secondary' : 'default'}>
              {post.likes.includes(user?._id) ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" gutterBottom>
            Comments ({post.comments.length})
          </Typography>

          {isAuthenticated ? (
            <form onSubmit={handleComment}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!comment.trim()}
                sx={{ mb: 4 }}
              >
                Post Comment
              </Button>
            </form>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Please login to comment
            </Typography>
          )}

          {post.comments.map((comment, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  src={comment.user.profilePicture}
                  alt={comment.user.username}
                  sx={{ width: 32, height: 32 }}
                />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2">
                    {comment.user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ ml: 6 }}>
                {comment.text}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Container>
  );
};

export default PostDetail;

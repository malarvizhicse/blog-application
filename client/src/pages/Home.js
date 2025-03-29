import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, IconButton, Box, TextField, Avatar, InputAdornment, Chip } from '@mui/material';
import { Favorite, FavoriteBorder, Comment as CommentIcon, Search as SearchIcon, AccessTime, FormatQuote } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "If you want to achieve greatness stop asking for permission.", author: "Anonymous" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" }
];

function Home() {
  const [currentQuote, setCurrentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchPosts();
    // Set up quote rotation
    const quoteInterval = setInterval(() => {
      const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(newQuote);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/posts');
      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
      
      // Fetch comments for each post
      const commentsPromises = data.map(post => 
        fetch(`http://localhost:5001/api/posts/${post._id}/comments`).then(res => res.json())
      );
      const commentsData = await Promise.all(commentsPromises);
      const commentsMap = {};
      data.forEach((post, index) => {
        commentsMap[post._id] = commentsData[index];
      });
      setComments(commentsMap);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => 
          post._id === postId ? updatedPost : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const updatedComments = await response.json();
        setComments({
          ...comments,
          [postId]: updatedComments
        });
        setNewComment('');
        setActiveCommentPost(null);
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getRandomColor = () => {
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
      'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
      'linear-gradient(135deg, #d97706 0%, #db2777 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Card 
          elevation={3}
          sx={{
            mb: 4,
            background: 'white',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: getRandomGradient()
          }} />
          <CardContent sx={{ position: 'relative', p: 4 }}>
            <FormatQuote 
              sx={{ 
                position: 'absolute',
                top: 16,
                left: 16,
                fontSize: '2rem',
                color: 'rgba(49, 130, 206, 0.2)',
                transform: 'rotate(180deg)'
              }} 
            />
            <Box sx={{ pl: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#2d3748',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  mb: 2,
                  fontStyle: 'italic'
                }}
              >
                "{currentQuote.text}"
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#4a5568',
                  fontWeight: 600,
                  textAlign: 'right'
                }}
              >
                — {currentQuote.author}
              </Typography>
            </Box>
            <FormatQuote 
              sx={{ 
                position: 'absolute',
                bottom: 16,
                right: 16,
                fontSize: '2rem',
                color: 'rgba(49, 130, 206, 0.2)'
              }} 
            />
          </CardContent>
        </Card>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          background: getRandomGradient(),
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'white',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            Recent Posts
          </Typography>
          <TextField
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: '250px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} key={post._id}>
              <Card sx={{ 
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: getRandomGradient(),
                  borderRadius: '12px 12px 0 0'
                }
              }}>
                <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={post.author?.avatar} 
                      sx={{ 
                        mr: 2, 
                        width: 48, 
                        height: 48,
                        border: '3px solid',
                        borderColor: getRandomColor()
                      }}
                    />
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        component={Link} 
                        to={`/profile/${post.author?._id}`}
                        sx={{ 
                          textDecoration: 'none',
                          color: '#1a202c',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          '&:hover': { color: getRandomColor() }
                        }}
                      >
                        {post.author?.username}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: '0.9rem', color: '#718096' }} />
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {format(new Date(post.createdAt), 'PPP')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#1a202c',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    mb: 2
                  }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#4a5568',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    mb: 3
                  }}>
                    {post.content}
                  </Typography>
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2, bgcolor: 'rgba(247, 250, 252, 0.8)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          onClick={() => handleLike(post._id)} 
                          sx={{ color: post.likes?.includes(user?._id) ? '#e53e3e' : '#718096' }}
                        >
                          {post.likes?.includes(user?._id) ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                          {post.likes?.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                          sx={{ color: '#718096' }}
                        >
                          <CommentIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                          {comments[post._id]?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                    {user && user._id === post.author?._id && (
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(post._id)}
                        sx={{ 
                          fontWeight: 600,
                          '&:hover': { backgroundColor: 'rgba(229, 62, 62, 0.1)' }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                  
                  {activeCommentPost === post._id && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ 
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleComment(post._id)}
                        sx={{
                          background: getRandomGradient(),
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                      >
                        Post Comment
                      </Button>
                    </Box>
                  )}
                  
                  {comments[post._id] && comments[post._id].length > 0 && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                      {comments[post._id].map((comment) => (
                        <Box 
                          key={comment._id} 
                          sx={{ 
                            mb: 2, 
                            pl: 2, 
                            borderLeft: '3px solid',
                            borderColor: getRandomColor(),
                            backgroundColor: 'white',
                            padding: '12px',
                            borderRadius: '0 8px 8px 0'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ color: '#2d3748', fontWeight: 700 }}>
                            {comment.author?.username}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4a5568', my: 1 }}>
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#718096' }}>
                            {format(new Date(comment.createdAt), 'PPP')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;

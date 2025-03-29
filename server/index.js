const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/blog_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Models
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String,
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' }
});

const Post = mongoose.model('Post', {
    title: String,
    content: String,
    image: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Routes
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');
        
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Create Post
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = new Post({
            title,
            content,
            image: req.file ? `/uploads/${req.file.filename}` : '',
            author: req.user._id
        });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get All Posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get Single Post
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) return res.status(404).send();
        res.send(post);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete Post
app.delete('/api/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });
        if (!post) return res.status(404).send();
        res.send(post);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get User Profile
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).send();
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update User Profile
app.put('/api/users/profile', auth, async (req, res) => {
    try {
        const updates = {};
        if (req.body.bio) updates.bio = req.body.bio;
        if (req.body.avatar) updates.avatar = req.body.avatar;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password');

        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Like/Unlike Post
app.post('/api/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send();

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }
        await post.save();
        res.send(post);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

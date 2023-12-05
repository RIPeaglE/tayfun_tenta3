const multer = require('multer');
const path = require('path');
const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');

// Initializing Prisma clients for user and post models
const prisma = new PrismaClient();
const prismaPost = new PrismaClient();
const server = express();

// Middleware for serving static files
server.use('/public', express.static(path.join(__dirname, 'public')));
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer for file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware for handling form 
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Middleware for session 
server.use(session({
  secret: 'te423',
  resave: false,
  saveUninitialized: true,
}));


server.set('view engine', 'ejs');
server.set('views', __dirname + '/views');

// home page
server.get('/', (req, res) => {
  res.render('index.ejs');
});

// rendering the create user page
server.get('/create', (req, res) => {
  res.render('create.ejs');
});

// creating a new user
server.post('/create', async (req, res) => {
  const { username, password, roll } = req.body;

  try {
    // Creating a new user using Prisma
    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        roll,
      },
    });

    console.log('User created:', newUser);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for rendering the create post page
server.get('/createPost', (req, res) => {
  // Checking user role for access control
  if (req.session.user && req.session.user.role === 'admin') {
    res.render('createPost.ejs');
  } else if (req.session.user && req.session.user.role === 'user') {
    // Redirecting users with 'user' role to the user dashboard
    res.redirect('/user-dashboard');
  } else {
    // Redirecting unauthenticated users to the home page
    res.redirect('/');
  }
});

// Route for handling post creation
server.post('/createPost', upload.single('image'), async (req, res) => {
  // Checking user role for access control
  if (req.session.user && req.session.user.role === 'admin') {
    const { title, comment, image, posted } = req.body;

    try {
      // Creating a new post using Prisma
      const newPost = await prismaPost.post.create({
        data: {
          title,
          comment,
          image: req.file.filename,
          posted,
        },
      });

      console.log('Post created:', newPost);
      res.redirect('/admin-dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).send('Internal Server Error');
    }
  } else if (req.session.user && req.session.user.role === 'user') {
    // Redirecting users with 'user' role to the user dashboard
    res.redirect('/user-dashboard');
  } else {
    // Redirecting unauthenticated users to the home page
    res.redirect('/');
  }
});

// handling user login
server.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Checking user credentials using Prisma
    const user = await prisma.user.findUnique({
      where: {
        username: username,
        password: password,
      },
    });

    if (user) {
      // Storing user information in the session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.roll,
      };

      if (user.roll === 'admin') {
        res.redirect('/admin-dashboard');
      } else {
        res.redirect('/user-dashboard');
      }
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// user logout
server.get('/logout', (req, res) => {
  // Destroying the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// admin dashboard
server.get('/admin-dashboard', async (req, res) => {
  try {
    // Fetching the latest post 
    const latestPost = await prismaPost.post.findFirst({
      orderBy: {
        posted: 'desc',
      },
    });
    // Checking if the user is logged in and has the 'admin' role
    if (req.session.user) { 
      // Fetching all posts for the admin dashboard
      const posts = await prismaPost.post.findMany({
        orderBy: {
          posted: 'desc',
        },
      });

      // admin dashboard with user information and posts
      res.render('admin-dashboard.ejs', { user: req.session.user, latestPost, posts });
    } else {
      // Redirecting to the login page if the user is not logged in
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Internal Server Error');
  }
});

// rendering the user dashboard
server.get('/user-dashboard', async (req, res) => {
  try {
    // Checking if the user is logged in and has the 'user' role
    if (req.session.user && req.session.user.role === 'user') {
      // Fetching all posts for the user dashboard
      const posts = await prismaPost.post.findMany({
        orderBy: {
          posted: 'desc',
        },
      });

      // Rendering the user dashboard with user information and posts
      res.render('user-dashboard.ejs', { user: req.session.user, posts });
    } else {
      // Redirecting to the home page if the user is not logged in or has the wrong role
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

// user logout
server.get('/user-logout', (req, res) => {
  // Destroying the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

server.listen(3000, () => {
  console.log('Express server started at port 3000');
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await prismaPost.$disconnect();
});
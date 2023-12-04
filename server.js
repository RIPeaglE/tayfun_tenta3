const multer = require('multer');
const path = require('path');
const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const prismaPost = new PrismaClient();
const server = express();

server.use('/public', express.static(path.join(__dirname, 'public')));
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(session({
  secret: 'te423',
  resave: false,
  saveUninitialized: true,
}));

server.set('view engine', 'ejs');
server.set('views', __dirname + '/views');

server.get('/', (req, res) => {
  res.render('index.ejs');
});

server.get('/create', (req, res) => {
  res.render('create.ejs');
});

server.get('/createPost', (req, res) => {
  res.render('createPost.ejs');
});

server.get('/flow', (req, res) => {
  res.render('flow.ejs');
});

server.post('/create', async (req, res) => {
  const { username, password, roll } = req.body;

  try {
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

server.post('/createPost', upload.single('image'), async (req, res) => {
  const { title, comment, image, posted } = req.body;

  try {
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
});

server.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
        password: password,
      },
    });

    if (user) {
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

server.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

server.get('/admin-dashboard', async (req, res) => {
  try {
    const latestPost = await prismaPost.post.findFirst({
      orderBy: {
        posted: 'desc',
      },
    });

    if (req.session.user) { // Check if user is logged in
      const posts = await prismaPost.post.findMany({
        orderBy: {
          posted: 'desc',
        },
      });

      res.render('admin-dashboard.ejs', { user: req.session.user, latestPost, posts });
    } else {
      res.redirect('/'); // Redirect to the login page
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Internal Server Error');
  }
});

server.get('/user-dashboard', async (req, res) => {
  try {
    if (req.session.user && req.session.user.role === 'user') {
      const posts = await prismaPost.post.findMany({
        orderBy: {
          posted: 'desc',
        },
      });

      res.render('user-dashboard.ejs', { user: req.session.user, posts });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

server.get('/user-logout', (req, res) => {
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

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const upload = require('./utils/upload');
const connectDB = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const paintRoutes = require('./routes/paintRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());


const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


const io = new Server(server, {
  cors: {
    origin: [/localhost/, /\.vercel\.app$/],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});


app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false  // Allow Cloudinary and external image URLs
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Upload Route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    url: req.file.path,           // Cloudinary secure URL
    public_id: req.file.filename  // Cloudinary public_id for deletion
  });
});

// Database Connection
connectDB();

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_order_tracking', (orderId) => {
    socket.join(orderId);
    console.log(`User joined order tracking: ${orderId}`);
  });

  socket.on('update_delivery_location', (data) => {
    // data: { orderId, coordinates: { lat, lng } }
    io.to(data.orderId).emit('delivery_location_changed', data.coordinates);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Pass io to routes
app.set('socketio', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ColorNest Nepal API' });
});
app.use('/api/auth', authRoutes);

app.use('/api/paints', paintRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);
const painterRoutes = require('./routes/painterRoutes');
app.use('/api/painters', painterRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

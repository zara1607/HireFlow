require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const socketHandler = require('./sockets/socketHandler');
const { getJwtSecret } = require('./utils/token');
const { seedData } = require('../scripts/seed');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const startServer = async () => {
  try {
    getJwtSecret();

    await connectDB();
    if (process.env.NODE_ENV === 'development' && process.env.SEED_DEMO_DATA !== 'false') {
      await seedData({ connect: false });
    }

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          const isAllowedOrigin = origin === 'http://localhost:5173' || /\.vercel\.app$/.test(origin);
          callback(isAllowedOrigin ? null : new Error('Not allowed by CORS'), isAllowedOrigin);
        },
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.id).select('_id name role');
        if (!user) return next(new Error('Authentication required'));
        socket.data.user = user;
        next();
      } catch {
        next(new Error('Authentication required'));
      }
    });

    app.set('io', io);
    socketHandler(io);

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 HireFlow Server running on port ${PORT}`);
      console.log(`📡 Client URL: ${CLIENT_URL}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err.message);
    process.exit(1);
  }
};

startServer();
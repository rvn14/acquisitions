import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '#routes/auth.routes.js';
import { securityMiddleware } from '#middleware/security.middleware.js';
import userRoutes from '#routes/users.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.use(securityMiddleware);
app.get('/', (req, res) => {
  logger.info('Received a request to the root endpoint');
  res.status(200).json({ message: 'Hello, World!' });
});

app.get('/health', (req, res) => {
  logger.info('Received a request to the health endpoint');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  logger.info('Received a request to the API root endpoint');
  res.status(200).json({ message: 'Welcome to the API!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

export default app;

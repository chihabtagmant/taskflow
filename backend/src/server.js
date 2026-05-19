import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';     // ← Must be imported
import taskRoutes from './routes/taskRoutes.js';           // ← Optional for now
import dashboardRoutes from './routes/dashboardRoutes.js'; // ← Optional
import activitiesRouter from './routes/activities.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', notificationsRouter);
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api/projects', projectRoutes);      // ← This line was probably missing
app.use('/api', taskRoutes);                  // For tasks
app.use('/api', dashboardRoutes);             // For dashboard

// Health check
app.get('/', (req, res) => res.send('TaskFlow API is running...'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
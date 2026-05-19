import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';     
import taskRoutes from './routes/taskRoutes.js';           
import dashboardRoutes from './routes/dashboardRoutes.js'; 
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);                  
app.use('/api', dashboardRoutes);
app.use('/api', activityRoutes);
app.use('/api', notificationRoutes);            

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
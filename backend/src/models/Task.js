import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute'],
    default: 'moyenne'
  },
  status: {
    type: String,
    enum: ['à faire', 'en cours', 'terminé'],
    default: 'à faire'
  },
  dueDate: {
    type: Date,
    required: false
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
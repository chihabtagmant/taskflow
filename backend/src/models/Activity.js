import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['task_created', 'task_updated', 'task_status_changed', 'task_deleted', 
           'member_added', 'member_removed', 'project_updated']
  },
  description: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
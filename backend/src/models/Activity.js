import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: [
      'task_created',
      'task_deleted',
      'status_changed',
      'member_added',
      'member_removed',
      'project_updated'
    ]
  },
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
  details: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
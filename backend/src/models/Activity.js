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
  action: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['actif', 'en pause', 'archivé'],
    default: 'actif'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Cascade delete tasks when project is deleted
projectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  await mongoose.model('Task').deleteMany({ project: this._id });
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
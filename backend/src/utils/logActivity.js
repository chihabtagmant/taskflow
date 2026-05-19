import Activity from '../models/Activity.js';

async function logActivity({ actionType, projectId, userId, details = {} }) {
  try {
    await Activity.create({
      actionType,
      project: projectId,
      user: userId,
      details
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

export default logActivity;
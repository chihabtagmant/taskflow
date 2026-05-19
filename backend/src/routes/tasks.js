const logActivity = require('../utils/logActivity');

await logActivity({
  actionType: 'task_created',
  projectId: task.project,
  userId: req.user.id,
  details: { taskTitle: task.title }
});

await logActivity({
  actionType: 'task_deleted',
  projectId: task.project,
  userId: req.user.id,
  details: { taskTitle: task.title }
});

await logActivity({
  actionType: 'status_changed',
  projectId: task.project,
  userId: req.user.id,
  details: { taskTitle: task.title, newStatus: req.body.status }
});

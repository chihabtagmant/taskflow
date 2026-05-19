const Activity = require('../models/Activity');
const Notification = require('../models/Notification'); 

/**
 
 * @param {Object} params
 * @param {string} params.actionType 
 * @param {string} params.projectId  
 * @param {string} params.userId     
 * @param {Object} params.details   
 */
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

module.exports = logActivity;
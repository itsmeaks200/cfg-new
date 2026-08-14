const analyticsService = require('../services/analytics.service');

async function adminAnalytics(req, res, next) {
  try {
    const result = await analyticsService.adminAnalytics();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { adminAnalytics };

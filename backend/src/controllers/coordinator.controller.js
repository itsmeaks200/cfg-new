const coordinatorService = require('../services/coordinator.service');

async function invite(req, res, next) {
  try {
    const result = await coordinatorService.createInvite({
      email: req.body.email,
      createdBy: req.user.id,
    });
    res.status(201).json({
      message: 'Coordinator invitation created',
      inviteCode: result.inviteCode,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const coordinators = await coordinatorService.listCoordinators();
    res.status(200).json(
      coordinators.map((c) => ({ id: c.id, name: c.name, email: c.email }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { invite, list };

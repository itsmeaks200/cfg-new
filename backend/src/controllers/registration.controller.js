const registrationService = require('../services/registration.service');

async function registerForEvent(req, res, next) {
  try {
    const registration = await registrationService.register(req.params.id, req.user.id);
    res.status(201).json({
      message: 'Registration successful',
      registration_id: registration.id,
      status: registration.status,
    });
  } catch (err) {
    next(err);
  }
}

async function unregisterFromEvent(req, res, next) {
  try {
    await registrationService.unregister(req.params.id, req.user.id);
    res.status(200).json({ message: 'Registration cancelled' });
  } catch (err) {
    next(err);
  }
}

async function myRegistrations(req, res, next) {
  try {
    const registrations = await registrationService.listMyRegistrations(req.user.id);
    res.status(200).json(registrations);
  } catch (err) {
    next(err);
  }
}

async function markAttendance(req, res, next) {
  try {
    await registrationService.markAttendance(req.params.id, req.body.status, req.user);
    res.status(200).json({ message: 'Attendance recorded' });
  } catch (err) {
    next(err);
  }
}

async function myAttendance(req, res, next) {
  try {
    const history = await registrationService.myAttendance(req.user.id);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerForEvent,
  unregisterFromEvent,
  myRegistrations,
  markAttendance,
  myAttendance,
};

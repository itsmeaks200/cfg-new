const eventService = require('../services/event.service');
const registrationService = require('../services/registration.service');
const userModel = require('../models/user.model');

async function create(req, res, next) {
  try {
    const { title, description, location, start_time, end_time, required_volunteers } = req.body;
    const event = await eventService.createEvent(
      {
        title,
        description,
        location,
        startTime: start_time,
        endTime: end_time,
        requiredVolunteers: required_volunteers,
      },
      req.user.id
    );
    res.status(201).json({ id: event.id, title: event.title, status: event.status });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const events = await eventService.listEvents({ status: req.query.status });
    res.status(200).json(
      events.map((e) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        start_time: e.start_time,
        required_volunteers: e.required_volunteers,
        registered_count: e.registered_count,
        status: e.status,
      }))
    );
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const event = await eventService.getEvent(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const fields = {};
    if (req.body.title !== undefined) fields.title = req.body.title;
    if (req.body.description !== undefined) fields.description = req.body.description;
    if (req.body.location !== undefined) fields.location = req.body.location;
    if (req.body.start_time !== undefined) fields.start_time = req.body.start_time;
    if (req.body.end_time !== undefined) fields.end_time = req.body.end_time;
    if (req.body.required_volunteers !== undefined) fields.required_volunteers = req.body.required_volunteers;

    const event = await eventService.updateEvent(req.params.id, fields, req.user);
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
}

async function assignCoordinator(req, res, next) {
  try {
    const event = await eventService.assignCoordinator(req.params.id, req.body.coordinator_id, userModel);
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
}

async function openRegistration(req, res, next) {
  try {
    await eventService.openRegistration(req.params.id, req.user);
    res.status(200).json({ message: 'Registration opened', status: 'OPEN' });
  } catch (err) {
    next(err);
  }
}

async function closeRegistration(req, res, next) {
  try {
    await eventService.closeRegistration(req.params.id, req.user);
    res.status(200).json({ message: 'Registration closed', status: 'CLOSED' });
  } catch (err) {
    next(err);
  }
}

async function listRegistrations(req, res, next) {
  try {
    const registrations = await registrationService.listEventRegistrations(req.params.id, req.user);
    res.status(200).json(registrations);
  } catch (err) {
    next(err);
  }
}

async function analytics(req, res, next) {
  try {
    const result = await registrationService.eventAnalytics(req.params.id, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  assignCoordinator,
  openRegistration,
  closeRegistration,
  listRegistrations,
  analytics,
};

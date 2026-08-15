const eventModel = require('../models/event.model');
const { ApiError } = require('../middleware/error.middleware');

function assertCanManage(event, user) {
  if (user.role === 'ADMIN') {
    return;
  }
  if (user.role === 'COORDINATOR' && event.coordinator_id === user.id) {
    return;
  }
  throw new ApiError(403, 'Forbidden');
}

async function assertIsCoordinator(coordinatorId, userModel) {
  const coordinator = await userModel.findById(coordinatorId);
  if (!coordinator || coordinator.role !== 'COORDINATOR') {
    throw new ApiError(400, 'coordinator_id must reference a user with role COORDINATOR');
  }
}

async function createEvent({ title, description, location, startTime, endTime, requiredVolunteers, coordinatorId }, adminId, userModel) {
  if (!title || !location || !startTime || !endTime || !requiredVolunteers) {
    throw new ApiError(400, 'title, location, start_time, end_time and required_volunteers are required');
  }
  if (requiredVolunteers <= 0) {
    throw new ApiError(400, 'required_volunteers must be greater than zero');
  }
  if (new Date(endTime) <= new Date(startTime)) {
    throw new ApiError(400, 'end_time must be after start_time');
  }
  if (coordinatorId) {
    await assertIsCoordinator(coordinatorId, userModel);
  }

  return eventModel.create({ title, description, location, startTime, endTime, requiredVolunteers, createdBy: adminId, coordinatorId });
}

async function listEvents({ status } = {}) {
  return eventModel.findAll({ status });
}

async function getEvent(id) {
  const event = await eventModel.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
}

async function updateEvent(id, fields, user) {
  const event = await getEvent(id);
  assertCanManage(event, user);
  return eventModel.update(id, fields);
}

async function assignCoordinator(id, coordinatorId, userModel) {
  const event = await getEvent(id);
  if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
    throw new ApiError(400, 'Cannot assign a coordinator to a cancelled or completed event');
  }

  await assertIsCoordinator(coordinatorId, userModel);

  return eventModel.assignCoordinator(id, coordinatorId);
}

async function openRegistration(id, user) {
  const event = await getEvent(id);
  assertCanManage(event, user);

  if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
    throw new ApiError(400, 'Event cannot accept registrations');
  }
  if (event.status === 'OPEN') {
    throw new ApiError(400, 'Registration is already open');
  }

  return eventModel.updateStatus(id, 'OPEN');
}

async function closeRegistration(id, user) {
  const event = await getEvent(id);
  assertCanManage(event, user);

  if (event.status !== 'OPEN') {
    throw new ApiError(400, 'Registration is not open');
  }

  return eventModel.updateStatus(id, 'CLOSED');
}

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  assignCoordinator,
  openRegistration,
  closeRegistration,
  assertCanManage,
};

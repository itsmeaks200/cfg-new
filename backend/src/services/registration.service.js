const pool = require('../config/db');
const eventModel = require('../models/event.model');
const registrationModel = require('../models/registration.model');
const attendanceModel = require('../models/attendance.model');
const { ApiError } = require('../middleware/error.middleware');
const { assertCanManage } = require('./event.service');

async function register(eventId, volunteerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const event = await eventModel.lockForUpdate(client, eventId);
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }
    if (event.status !== 'OPEN') {
      throw new ApiError(400, 'Registration is not open for this event');
    }

    const existing = await registrationModel.findActiveByEventAndVolunteer(client, eventId, volunteerId);
    if (existing) {
      throw new ApiError(409, 'Already registered for this event');
    }

    const activeCount = await registrationModel.countActiveByEvent(client, eventId);
    if (activeCount >= event.required_volunteers) {
      throw new ApiError(409, 'Event has reached capacity');
    }

    const registration = await registrationModel.create(client, { eventId, volunteerId });

    await client.query('COMMIT');
    return registration;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function unregister(eventId, volunteerId) {
  const client = await pool.connect();
  try {
    const existing = await registrationModel.findActiveByEventAndVolunteer(client, eventId, volunteerId);
    if (!existing) {
      throw new ApiError(404, 'No active registration found for this event');
    }
    await registrationModel.cancel(existing.id);
  } finally {
    client.release();
  }
}

async function listMyRegistrations(volunteerId) {
  return registrationModel.findByVolunteer(volunteerId);
}

async function listEventRegistrations(eventId, user) {
  const event = await eventModel.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  assertCanManage(event, user);
  return registrationModel.findByEvent(eventId);
}

async function markAttendance(registrationId, status, user) {
  if (!['PRESENT', 'ABSENT'].includes(status)) {
    throw new ApiError(400, 'status must be PRESENT or ABSENT');
  }

  const registration = await registrationModel.findById(registrationId);
  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  const event = await eventModel.findById(registration.event_id);
  assertCanManage(event, user);

  return attendanceModel.markAttendance(registrationId, status);
}

async function myAttendance(volunteerId) {
  return attendanceModel.findByVolunteer(volunteerId);
}

async function eventAnalytics(eventId, user) {
  const event = await eventModel.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  assertCanManage(event, user);

  const attendanceCount = await attendanceModel.countByEventAndStatus(eventId, 'PRESENT');

  return {
    required: event.required_volunteers,
    registered: event.registered_count,
    remaining: Math.max(event.required_volunteers - event.registered_count, 0),
    attendance: attendanceCount,
  };
}

module.exports = {
  register,
  unregister,
  listMyRegistrations,
  listEventRegistrations,
  markAttendance,
  myAttendance,
  eventAnalytics,
};

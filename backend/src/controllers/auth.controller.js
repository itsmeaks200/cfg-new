const authService = require('../services/auth.service');
const userModel = require('../models/user.model');

async function signup(req, res, next) {
  try {
    await authService.signupVolunteer(req.body);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    next(err);
  }
}

async function coordinatorSignup(req, res, next) {
  try {
    await authService.coordinatorSignup(req.body);
    res.status(201).json({ message: 'Coordinator account created successfully' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body);
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, coordinatorSignup, login, me, refresh, logout };

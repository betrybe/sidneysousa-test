const {
  Router,
} = require('express');
const validator = require('email-validator');

const User = require('../models/User');
const userCtrl = require('../controllers/user_controller');
const {
  validateToken,
  getToken,
} = require('../utils/token_utils');

const isEmailAlreadyRegistered = async (email) => {
  const userWithAlreadyRegisteredEmail = await User.find({
    email,
  });

  return userWithAlreadyRegisteredEmail && userWithAlreadyRegisteredEmail.length > 0;
};

const validateUserInputs = (name, email, password) =>
  name && email && password && validator.validate(email);

const validateUserCreation = async (name, email, password) => {
  let response = {
    message: 'Ok',
    statusCode: 201,
  };

  if (!validateUserInputs(name, email, password)) {
    response = {
      message: 'Invalid entries. Try again.',
      statusCode: 400,
    };
  } else if (await isEmailAlreadyRegistered(email)) {
    response = {
      message: 'Email already registered',
      statusCode: 409,
    };
  }

  return response;
};

const validateAdminUserCreation = async (token, name, email, password) => {
  const userId = await validateToken(token);
  const isAdmin = await userCtrl.isAdmin(userId);
  const response = await validateUserCreation(name, email, password);

  if (!isAdmin) {
    response.statusCode = 403;
    response.message = 'Only admins can register new admins';
  }

  return response;
};

const userRouter = Router();

userRouter.post('/', async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  const response = await validateUserCreation(name, email, password);

  if (response.message === 'Ok') {
    const user = await userCtrl.save(name, email, password);
    return res.status(response.statusCode).json({
      user,
    });
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
});

userRouter.post('/admin', async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;
  const token = getToken(req);

  const response = await validateAdminUserCreation(token, name, email, password);

  if (response.message === 'Ok') {
    const role = 'admin';
    const user = await userCtrl.save(name, email, password, role);
    return res.status(response.statusCode).json({
      user,
    });
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
});

module.exports = userRouter;
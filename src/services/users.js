const {
  Router,
} = require('express');
const validator = require('email-validator');

const User = require('../models/User');
const userCtrl = require('../controllers/user_controller');

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
    statusCode: 200,
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
    return res.status(201).json({
      user,
    });
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
});

module.exports = userRouter;
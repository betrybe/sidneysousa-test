const {
  Router,
} = require('express');
const {
  sign,
} = require('jsonwebtoken');
const validator = require('email-validator');

const {
  SECRET,
} = require('../config/secret');
const loginCtrl = require('../controllers/user_controller');

const getToken = async (email) => {
  const user = await loginCtrl.findByEmail(email);
  const {
    _id,
  } = user;
  const token = sign({
      user: _id,
      timestamp: new Date(),
    },
    SECRET, {
      expiresIn: '1h',
    });

  return token;
};

const validateUserInputs = (email, password) => email && password;

const areCredentialsValid = async (email, password) => {
  const isEmailValid = validator.validate(email);
  const isLoginValid = await loginCtrl.login(email, password);

  return isEmailValid && isLoginValid;
};

const validateUserLogin = async (email, password) => {
  const areFieldsValid = validateUserInputs(email, password);
  const isLoginValid = areFieldsValid && await areCredentialsValid(email, password);
  const statusCode = isLoginValid ? 200 : 401;

  return {
    token: isLoginValid ? await getToken(email) : '',
    statusCode,
    areFieldsValid,
    isLoginValid,
  };
};

const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  const validationResponse = await validateUserLogin(email, password);
  if (validationResponse.statusCode === 200) {
    return res.status(validationResponse.statusCode).json({
      token: validationResponse.token,
    });
  }

  const msg1 = 'Incorrect username or password';
  const msg2 = 'All fields must be filled';
  return res.status(validationResponse.statusCode).json({
    message: validationResponse.areFieldsValid ? msg1 : msg2,
  });
});

module.exports = loginRouter;
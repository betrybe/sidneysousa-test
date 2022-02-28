const User = require('../models/User');

const isPasswordCorrect = (user, password) => user && (password === user.password);

const controller = {
  save: async (name, email, password) => {
    const savedUser = await User.create({
      name,
      email,
      password,
    });

    return savedUser;
  },
  login: async (email, password) => {
    const user = await User.findOne({
      email,
    });

    const isLoginCorrect = isPasswordCorrect(user, password);
    return isLoginCorrect;
  },
  findByEmail: async (email) => {
    const user = await User.findOne({
      email,
    });

    return user;
  },
};

module.exports = controller;
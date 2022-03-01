const {
  ObjectId,
} = require('mongodb').ObjectId;

const User = require('../models/User');

const isPasswordCorrect = (user, password) => user && (password === user.password);

const controller = {
  save: async (name, email, password, role) => {
    const userRole = !role ? 'user' : role;
    const savedUser = await User.create({
      name,
      email,
      password,
      role: userRole,
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
  isAdmin: async (id) => {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const user = await User.findById(id);

    return user.role === 'admin';
  },
};

module.exports = controller;
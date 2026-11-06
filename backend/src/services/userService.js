const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const memoryUsers = new Map(); // id -> user object
const emailIndex = new Map();  // email -> id

const createUser = async ({ name, email, password }) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.create({
        name,
        email,
        passwordHash: password,
      });
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (err) {
      console.warn('MongoDB User.create failed, falling back to memory:', err.message);
    }
  }

  // Memory fallback
  const id = new mongoose.Types.ObjectId().toString();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const userObj = {
    _id: id,
    id,
    name,
    email,
    passwordHash,
    createdAt: new Date(),
  };
  memoryUsers.set(id, userObj);
  emailIndex.set(email.toLowerCase(), id);

  return {
    _id: id,
    id,
    name,
    email,
    createdAt: userObj.createdAt,
  };
};

const findUserByEmail = async (email) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email });
      if (user) return user;
    } catch (err) {
      console.warn('MongoDB User.findOne failed, checking memory:', err.message);
    }
  }

  const id = emailIndex.get(email.toLowerCase());
  if (id && memoryUsers.has(id)) {
    const memUser = memoryUsers.get(id);
    return {
      _id: memUser._id,
      id: memUser.id,
      name: memUser.name,
      email: memUser.email,
      passwordHash: memUser.passwordHash,
      comparePassword: async (candidate) => bcrypt.compare(candidate, memUser.passwordHash),
      toJSON: () => ({
        _id: memUser._id,
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        createdAt: memUser.createdAt,
      }),
    };
  }
  return null;
};

const findUserById = async (id) => {
  const idStr = id.toString();
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(idStr);
      if (user) return user;
    } catch (err) {
      // fallback
    }
  }

  if (memoryUsers.has(idStr)) {
    const memUser = memoryUsers.get(idStr);
    return {
      _id: memUser._id,
      id: memUser.id,
      name: memUser.name,
      email: memUser.email,
      createdAt: memUser.createdAt,
      toJSON: () => ({
        _id: memUser._id,
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        createdAt: memUser.createdAt,
      }),
    };
  }
  return null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};

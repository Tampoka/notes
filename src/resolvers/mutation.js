const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');
require('dotenv').config();
const mongoose = require('mongoose');

const gravatar = require('../util/gravatar');
module.exports = {
  newNote: async (parent, args, { models,user }) => {
    // Если в контексте нет пользователя, выбрасываем AuthenticationError
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }
    return await models.Note.create({
      content: args.content,
      author: new mongoose.Types.ObjectId(user.id),
    });
  },
  updateNote: async (parent, {id,content}, { models,user }) => {
    // Если не пользователь, выбрасываем ошибку авторизации
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }
    // Находим заметку
    const note = await models.Note.findById(id);
// Если владелец заметки и текущий пользователь не совпадают, выбрасываем
// запрет на действие
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
  },
  deleteNote: async (parent, {id}, { models,user }) => {
    // Если не пользователь, выбрасываем ошибку авторизации
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }
    // Находим заметку
    const note = await models.Note.findById(id);
// Если владелец заметки и текущий пользователь не совпадают, выбрасываем
// запрет на действие
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }
    try {
      // Если все проверки проходят, удаляем заметку
      await note.deleteOne();
      return true;
    } catch (e) {
      // Если в процессе возникает ошибка, возвращаем false
      return false;
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    // Нормализуем email
    email = email.trim().toLowerCase();
    // Хешируем пароль
    const hashed = await bcrypt.hash(password, 10);
    // Создаем граватар
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });
      // Создаем и возвращаем json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (e) {
      console.log(e);
      // Если при регистрации возникла проблема, выбрасываем ошибку
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      // Нормализуем email
      email = email.trim().toLowerCase();
    }
    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });
    // Если пользователь не найден, выбрасываем ошибку аутентификации
    if (!user) {
      throw new AuthenticationError('Error signing in');
    }
    // Если пароль не совпадает, выбрасываем ошибку аутентификации
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }
    // Создаем и возвращаем json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

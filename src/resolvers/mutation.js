const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');
module.exports = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Traveler',
    });
    // let noteValue = {
    //   id: String(notes.length + 1),
    //   content: args.content,
    //   author: 'Traveler',
    // };
    // notes.push(noteValue);
    // return noteValue;
  },
  updateNote: async (parent, args, { models }) => {
    return await models.Note.findOneAndUpdate(
      {
        _id: args.id,
      },
      {
        $set: {
          content: args.content,
        },
      },
      {
        new: true,
      }
    );
  },
  deleteNote: async (parent, args, { models }) => {
    // return await models.Note.findOneAndRemove({ _id: args.id });
    try {
      await models.Note.findOneAndRemove({ _id: args.id });
      return true;
    } catch (e) {
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
};

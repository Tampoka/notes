module.exports = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },
  note: async (parent, {id}, { models }) => {
    return models.Note.findById(id);
  },
  user: async (parent, { username }, { models }) => {
    // Находим пользователя по имени
    return  models.User.findOne({ username })
  },
  users: async (parent, args, { models }) => {
    // Находим всех пользователей
    return  models.User.find({})
  },
  me: async (parent, args, { models, user }) => {
    // Находим пользователя по текущему пользователю
    return  models.User.findById(user.id);
  }
};

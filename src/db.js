// Затребуем библиотеку mongoose
const mongoose = require('mongoose');
module.exports = {
  connect: (DB_HOST) => {
    // Используем обновленный парсер строки URL драйвера Mongo
    // Поставим findOneAndUpdate () вместо findAndModify ()
    // Поставим createIndex () вместо sureIndex ()
    // Используем новый механизм обнаружения и мониторинга серверов
    // Подключаемся к БД
    mongoose.connect(DB_HOST);
    // Выводим ошибку при неуспешном подключении
    mongoose.connection.on('error', (err) => {
      console.error(err);
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running.'
      );
      process.exit();
    });
  },
  close: () => {
    mongoose.connection.close();
  },
};

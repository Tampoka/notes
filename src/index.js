const express = require('express');
const {ApolloServer} = require('apollo-server-express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

// Получаем информацию пользователя из JWT
const getUser = token => {
    if (token) {
        try {
// Возвращаем информацию пользователя из токена
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
// Если с токеном возникла проблема, выбрасываем ошибку
            new Error('Session invalid');
        }
    }
};

const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
// Устанавливаем промежуточное ПО Helmet
app.use(helmet());
// Устанавливаем промежуточное ПО CORS
app.use(cors());

db.connect(DB_HOST);

// Настраиваем Apollo Server
async function startServer() {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
        context: ({req}) => {
            // Получаем токен пользователя из заголовков
            const token = req.headers.authorization;
// Пытаемся извлечь пользователя с помощью токена
            const user = getUser(token);
// Пока что будем выводить информацию о пользователе в консоль:
            console.log(user);
// Добавляем модели БД и пользователя в контекст
            return {models, user};
        },
    });
    await apolloServer.start();
// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
    apolloServer.applyMiddleware({app, path: '/api'});
}

startServer();

app.get('/', (req, res) => {
  res.send('Hello World!!!!!');
});

app.listen(port, () => {
    console.log(
        `GraphQL Server running at http://localhost:${port}/api`
    );
})

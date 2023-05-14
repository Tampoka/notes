const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

db.connect(DB_HOST);

// Настраиваем Apollo Server
async function startServer() {
    apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => {
            // Добавление моделей БД в context
            return {models};
        },
    });
    await apolloServer.start();
// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
    apolloServer.applyMiddleware({app, path: '/api'});
}
    startServer();

// app.get('/', (req, res) => {
//   res.send('Hello World!!!!!');
// });

    app.listen(port, () => {
        console.log(
            // `GraphQL Server running at http://localhost:${port}${apolloServer.graphqlPath}`
            `GraphQL Server running at http://localhost:${port}/api`
        );
    });

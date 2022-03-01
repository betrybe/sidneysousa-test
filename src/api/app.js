const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const userRouter = require('../services/users');
const loginRouter = require('../services/login');
const recipeRouter = require('../services/recipes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger('dev'));

app.use('/users', userRouter);
app.use('/login', loginRouter);
app.use('/recipes', recipeRouter);

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

module.exports = app;